// const pool = require('../config/db');

// class File {
//   static async create({ user_id, originalname, gcs_path, folder_path, mimetype, size }) {
//     const result = await pool.query(
//       `INSERT INTO user_files (user_id, originalname, gcs_path, folder_path, mimetype, size)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [user_id, originalname, gcs_path, folder_path, mimetype, size]
//     );
//     return result.rows[0];
//   }

//   static async findByUserId(user_id) {
//     const result = await pool.query('SELECT * FROM user_files WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
//     return result.rows;
//   }

//   static async findById(id) {
//     const result = await pool.query('SELECT * FROM user_files WHERE id = $1', [id]);
//     return result.rows[0];
//   }

//   static async delete(id) {
//     const result = await pool.query('DELETE FROM user_files WHERE id = $1 RETURNING *', [id]);
//     return result.rows[0];
//   }

//   static async getTotalStorageUsed(user_id) {
//     const result = await pool.query(
//       'SELECT COALESCE(SUM(size), 0) AS total_size FROM user_files WHERE user_id = $1',
//       [user_id]
//     );
//     return parseInt(result.rows[0].total_size, 10);
//   }
// }


// module.exports = File;


const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Import uuid

class File {
  // Create a new file or folder
  static async create({ user_id, originalname, gcs_path, folder_path, mimetype, size, is_folder = false }) {
    const id = uuidv4(); // Generate a UUID for the new file/folder
    const result = await pool.query(
      `INSERT INTO user_files (id, user_id, originalname, gcs_path, folder_path, mimetype, size, is_folder, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [id, user_id, originalname, gcs_path, folder_path, mimetype, size, is_folder]
    );
    return result.rows[0];
  }

  // Find all files and folders by user ID
  static async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM user_files WHERE user_id = $1 ORDER BY is_folder DESC, created_at DESC', 
      [user_id]
    );
    return result.rows;
  }

  // Find files and folders in a specific folder path
  static async findByUserIdAndFolderPath(user_id, folder_path) {
    // Handle null/empty folder_path for root level
    let query, params;
    
    if (!folder_path || folder_path === '') {
      query = `
        SELECT * FROM user_files 
        WHERE user_id = $1 AND (folder_path IS NULL OR folder_path = '')
        ORDER BY is_folder DESC, originalname ASC
      `;
      params = [user_id];
    } else {
      query = `
        SELECT * FROM user_files 
        WHERE user_id = $1 AND folder_path = $2
        ORDER BY is_folder DESC, originalname ASC
      `;
      params = [user_id, folder_path];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Find a specific file by ID
  static async findById(id) {
    const result = await pool.query('SELECT * FROM user_files WHERE id = $1::uuid', [id]); // Cast to UUID
    return result.rows[0];
  }

  // Find a folder by name and path
  static async findFolderByPath(user_id, folder_name, parent_path = '') {
    const folder_path = parent_path ? `${parent_path}/${folder_name}` : folder_name;
    
    const result = await pool.query(
      'SELECT * FROM user_files WHERE user_id = $1 AND originalname = $2 AND folder_path = $3 AND is_folder = true',
      [user_id, folder_name, parent_path]
    );
    return result.rows[0];
  }

  // Check if folder exists
  static async folderExists(user_id, folder_name, parent_path = '') {
    const folder = await this.findFolderByPath(user_id, folder_name, parent_path);
    return !!folder;
  }

  // Get all files in a folder and its subfolders (recursive)
  static async getFilesInFolderRecursive(user_id, folder_path) {
    const result = await pool.query(
      `SELECT * FROM user_files 
       WHERE user_id = $1 AND (folder_path = $2 OR folder_path LIKE $3)
       ORDER BY folder_path, is_folder DESC, originalname ASC`,
      [user_id, folder_path, `${folder_path}/%`]
    );
    return result.rows;
  }

  // Get folder statistics (file count, total size)
  static async getFolderStats(user_id, folder_path) {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as file_count,
         COALESCE(SUM(CASE WHEN is_folder = false THEN size ELSE 0 END), 0) as total_size,
         COUNT(CASE WHEN is_folder = true THEN 1 END) as subfolder_count,
         COUNT(CASE WHEN is_folder = false THEN 1 END) as document_count
       FROM user_files 
       WHERE user_id = $1 AND (folder_path = $2 OR folder_path LIKE $3)`,
      [user_id, folder_path, `${folder_path}/%`]
    );
    return {
      fileCount: parseInt(result.rows[0].file_count, 10),
      totalSize: parseInt(result.rows[0].total_size, 10),
      subfolderCount: parseInt(result.rows[0].subfolder_count, 10),
      documentCount: parseInt(result.rows[0].document_count, 10)
    };
  }

  // Delete a file or folder
  static async delete(id) {
    const result = await pool.query('DELETE FROM user_files WHERE id = $1::uuid RETURNING *', [id]); // Cast to UUID
    return result.rows[0];
  }

  // Delete all files in a folder (for folder deletion)
  static async deleteFilesInFolder(user_id, folder_path) {
    const result = await pool.query(
      'DELETE FROM user_files WHERE user_id = $1 AND (folder_path = $2 OR folder_path LIKE $3) RETURNING *',
      [user_id, folder_path, `${folder_path}/%`]
    );
    return result.rows;
  }

  // Update file information
  static async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE user_files SET ${setClause}, updated_at = NOW() WHERE id = $1::uuid RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  // Move file to different folder
  static async moveToFolder(id, new_folder_path) {
    const result = await pool.query(
      'UPDATE user_files SET folder_path = $2, updated_at = NOW() WHERE id = $1::uuid RETURNING *',
      [id, new_folder_path]
    );
    return result.rows[0];
  }

  // Get total storage used by user
  static async getTotalStorageUsed(user_id) {
    const result = await pool.query(
      'SELECT COALESCE(SUM(size), 0) AS total_size FROM user_files WHERE user_id = $1 AND is_folder = false',
      [user_id]
    );
    return parseInt(result.rows[0].total_size, 10);
  }

  // Get storage used in specific folder
  static async getFolderStorageUsed(user_id, folder_path) {
    const result = await pool.query(
      `SELECT COALESCE(SUM(size), 0) AS total_size 
       FROM user_files 
       WHERE user_id = $1 AND is_folder = false AND (folder_path = $2 OR folder_path LIKE $3)`,
      [user_id, folder_path, `${folder_path}/%`]
    );
    return parseInt(result.rows[0].total_size, 10);
  }

  // Search files by name
  static async searchFiles(user_id, searchTerm) {
    const result = await pool.query(
      `SELECT * FROM user_files 
       WHERE user_id = $1 AND originalname ILIKE $2
       ORDER BY is_folder DESC, originalname ASC`,
      [user_id, `%${searchTerm}%`]
    );
    return result.rows;
  }

  // Get recent files
  static async getRecentFiles(user_id, limit = 10) {
    const result = await pool.query(
      `SELECT * FROM user_files 
       WHERE user_id = $1 AND is_folder = false
       ORDER BY created_at DESC 
       LIMIT $2`,
      [user_id, limit]
    );
    return result.rows;
  }

  // Get files by type
  static async getFilesByType(user_id, mimetype_pattern) {
    const result = await pool.query(
      `SELECT * FROM user_files 
       WHERE user_id = $1 AND is_folder = false AND mimetype LIKE $2
       ORDER BY created_at DESC`,
      [user_id, mimetype_pattern]
    );
    return result.rows;
  }

  // Get folder tree structure
  static async getFolderTree(user_id) {
    const result = await pool.query(
      `SELECT * FROM user_files 
       WHERE user_id = $1 
       ORDER BY folder_path NULLS FIRST, is_folder DESC, originalname ASC`,
      [user_id]
    );
    return result.rows;
  }

  // Rename file or folder
  static async rename(id, new_name) {
    const result = await pool.query(
      'UPDATE user_files SET originalname = $2, updated_at = NOW() WHERE id = $1::uuid RETURNING *',
      [id, new_name]
    );
    return result.rows[0];
  }

  // Get duplicate files (same name in same folder)
  static async findDuplicates(user_id, originalname, folder_path) {
    let query, params;
    
    if (!folder_path || folder_path === '') {
      query = `
        SELECT * FROM user_files 
        WHERE user_id = $1 AND originalname = $2 AND (folder_path IS NULL OR folder_path = '')
      `;
      params = [user_id, originalname];
    } else {
      query = `
        SELECT * FROM user_files 
        WHERE user_id = $1 AND originalname = $2 AND folder_path = $3
      `;
      params = [user_id, originalname, folder_path];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Batch delete files
  static async batchDelete(ids) {
    // Ensure all IDs are cast to UUID
    const uuidIds = ids.map(id => `${id}::uuid`);
    const result = await pool.query(
      `DELETE FROM user_files WHERE id = ANY(ARRAY[${uuidIds.join(', ')}]) RETURNING *`,
      [] // No direct parameters needed if casting in query
    );
    return result.rows;
  }

  // Get file count by folder
  static async getFileCountByFolder(user_id) {
    const result = await pool.query(
      `SELECT 
         COALESCE(folder_path, 'root') as folder_path,
         COUNT(CASE WHEN is_folder = false THEN 1 END) as file_count,
         COUNT(CASE WHEN is_folder = true THEN 1 END) as folder_count
       FROM user_files 
       WHERE user_id = $1
       GROUP BY folder_path
       ORDER BY folder_path`,
      [user_id]
    );
    return result.rows;
  }

  // Get file metadata with signed URL info
  static async getFileWithMetadata(id) {
    const result = await pool.query(
      `SELECT *,
       EXTRACT(EPOCH FROM created_at) as created_timestamp,
       EXTRACT(EPOCH FROM updated_at) as updated_timestamp
       FROM user_files WHERE id = $1::uuid`, // Cast to UUID
      [id]
    );
    return result.rows[0];
  }
}

module.exports = File;
