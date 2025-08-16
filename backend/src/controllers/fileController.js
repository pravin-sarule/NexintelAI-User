


const File = require('../models/File');
const FileChat = require('../models/FileChat');
const FileChunk = require('../models/FileChunk');
const { uploadFileToGCS, checkStorageLimit, getSignedUrlForFile } = require('../utils/storage');
const { bucket } = require('../config/gcs');
const path = require('path');
const { Readable } = require('stream');
const archiver = require('archiver');
const { Storage } = require('@google-cloud/storage');
const { askGemini } = require('../../services/aiService');
const { getEmbeddings } = require('../../services/embeddingService');

const storage = new Storage();

// Upload single file
// const uploadFile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { folderPath = '' } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded.' });
//     }

//     const file = req.file;

//     // Check storage limits
//     const isAllowed = await checkStorageLimit(userId, file.size);
//     if (!isAllowed) {
//       return res.status(403).json({ message: 'Storage limit exceeded.' });
//     }

//     // Clean folder path
//     const cleanFolderPath = folderPath ? folderPath.replace(/^\/+|\/+$/g, '') : '';
    
//     // Construct GCS path
//     const gcsPath = cleanFolderPath 
//       ? `${userId}/${cleanFolderPath}/${file.originalname}`
//       : `${userId}/${file.originalname}`;

//     const blob = bucket.file(gcsPath);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       metadata: {
//         contentType: file.mimetype,
//       },
//     });

//     await new Promise((resolve, reject) => {
//       blobStream.on('error', reject);
//       blobStream.on('finish', resolve);
//       blobStream.end(file.buffer);
//     });

//     // Save metadata to database
//     const savedFile = await File.create({
//       user_id: userId,
//       originalname: file.originalname,
//       gcs_path: gcsPath,
//       folder_path: cleanFolderPath || null,
//       mimetype: file.mimetype,
//       size: file.size,
//     });

//     return res.status(201).json({
//       message: 'File uploaded successfully',
//       file: savedFile,
//     });
//   } catch (error) {
//     console.error('❌ Error uploading file:', error);
//     res.status(500).json({
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };
// ---------- Helpers ----------
/** Keep only safe characters in a path segment; forbid empty/.. segments */
function sanitizeSegment(seg) {
  const cleaned = String(seg)
    .trim()
    .replace(/\\/g, '/')              // backslashes -> slashes
    .replace(/[^\w\-./ ]+/g, '');     // drop weird chars (allow . _ - / space)
  if (!cleaned || cleaned === '.' || cleaned === '..') return '';
  // segments only, not full path
  return cleaned.replace(/\//g, '');
}

/** Sanitize folder path: "a//b/../c" -> "a/b/c" (.. and empty segments removed) */
function sanitizeFolderPath(folderPath = '') {
  return String(folderPath)
    .split('/')
    .map(sanitizeSegment)
    .filter(Boolean)
    .join('/');
}

/** Make a safe filename and preserve/derive extension */
function sanitizeFilename(originalname, fallbackExt = '') {
  const base = path.posix.basename(originalname || 'file');
  let name = base.replace(/\\/g, '/').split('/').pop() || 'file';
  // separate name + ext
  let ext = path.posix.extname(name);
  let stem = ext ? name.slice(0, -ext.length) : name;

  stem = stem.replace(/[^\w\- .]+/g, '').trim() || 'file';
  ext = (ext || fallbackExt || '').replace(/[^.\w]+/g, '');

  // Avoid filenames like "file."
  if (ext && !ext.startsWith('.')) ext = `.${ext}`;
  return `${stem}${ext}`;
}

/** Ensure object key doesn't already exist: add " (1)", " (2)" etc. */
async function ensureUniqueKey(key) {
  const dir = path.posix.dirname(key);
  const name = path.posix.basename(key);
  const ext = path.posix.extname(name);
  const stem = ext ? name.slice(0, -ext.length) : name;

  let candidate = key;
  let counter = 1;

  // Try up to a reasonable number of attempts (rarely needed)
  // You can also switch to a timestamp-based suffix if preferred.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [exists] = await bucket.file(candidate).exists();
    if (!exists) return candidate;
    candidate = path.posix.join(dir, `${stem} (${counter})${ext}`);
    counter += 1;
  }
}

/** Short-lived signed URL to preview/download the file */
async function makeSignedReadUrl(objectKey, minutes = 15) {
  const [signedUrl] = await bucket.file(objectKey).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + minutes * 60 * 1000,
  });
  return signedUrl;
}

// ---------- Controller ----------
const uploadFile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { folderPath = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const file = req.file;

    // Optional: server-side max size guard (in bytes)
    const MAX_BYTES = 1024 * 1024 * 50; // 50 MB as example
    if (file.size > MAX_BYTES) {
      return res.status(413).json({ message: 'File too large.' });
    }

    // Check storage quota
    const isAllowed = await checkStorageLimit(userId, file.size);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Storage limit exceeded.' });
    }

    // Sanitize folder path and filename
    const safeFolder = sanitizeFolderPath(folderPath);
    const inferredExt = mime.extension(file.mimetype) || '';
    const safeName = sanitizeFilename(file.originalname, inferredExt ? `.${inferredExt}` : '');

    // Build object key (bucket-relative). Never include bucket name or full URL.
    const key = safeFolder
      ? path.posix.join(String(userId), safeFolder, safeName)
      : path.posix.join(String(userId), safeName);

    // Ensure no collisions
    const uniqueKey = await ensureUniqueKey(key);

    // Upload to GCS
    const fileRef = bucket.file(uniqueKey);
    await new Promise((resolve, reject) => {
      const stream = fileRef.createWriteStream({
        resumable: false, // memory upload; set true for very large files
        metadata: {
          contentType: file.mimetype || mime.lookup(safeName) || 'application/octet-stream',
          cacheControl: 'private, max-age=0, no-transform',
          // Optional:
          // contentDisposition: `inline; filename="${encodeURIComponent(safeName)}"`,
        },
      });
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(file.buffer);
    });

    // Persist metadata in DB (store RELATIVE key!)
    const savedFile = await File.create({
      user_id: userId,
      originalname: safeName,
      gcs_path: uniqueKey,              // ✅ relative key only
      folder_path: safeFolder || null,  // nullable
      mimetype: file.mimetype,
      size: file.size,
    });

    // Optional: return a short-lived preview URL
    const previewUrl = await makeSignedReadUrl(uniqueKey, 15);

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        ...savedFile,            // if ORM returns instance, map to JSON as needed
        previewUrl,              // short-lived URL for immediate use
        bucket: BUCKET_NAME,     // useful for debugging
        key: uniqueKey,          // the stored key
      },
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
// Upload multiple files (folder upload)
const uploadFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderPath = '' } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);

    const isAllowed = await checkStorageLimit(userId, totalSize);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Storage limit exceeded.' });
    }

    const uploadedFiles = [];
    const cleanBaseFolderPath = folderPath ? folderPath.replace(/^\/+|\/+$/g, '') : '';

    for (const file of req.files) {
      // Handle webkitRelativePath for folder uploads
      const relativePath = file.webkitRelativePath || file.originalname;
      
      // Construct the full path
      const fullPath = cleanBaseFolderPath 
        ? `${cleanBaseFolderPath}/${relativePath}`
        : relativePath;
      
      const gcsPath = `${userId}/${fullPath}`;
      
      // Extract folder path from the full path
      const fileDir = path.dirname(fullPath);
      const fileFolderPath = fileDir === '.' ? cleanBaseFolderPath : fileDir;

      // Upload to GCS
      const blob = bucket.file(gcsPath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', resolve);
        blobStream.end(file.buffer);
      });

      // Save metadata to DB
      const dbFile = await File.create({
        user_id: userId,
        originalname: path.basename(relativePath),
        gcs_path: gcsPath,
        folder_path: fileFolderPath || null,
        mimetype: file.mimetype,
        size: file.size,
      });

      uploadedFiles.push(dbFile);
    }

    return res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('❌ Error uploading folder:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create a new folder
const createFolder = async (req, res) => {
  try {
    const { folderName, parentPath = '' } = req.body;
    const userId = req.user.id;

    if (!folderName) {
      return res.status(400).json({ message: 'Folder name required.' });
    }

    // Clean paths
    const cleanParentPath = parentPath ? parentPath.replace(/^\/+|\/+$/g, '') : '';
    const cleanFolderName = folderName.replace(/^\/+|\/+$/g, '');
    
    // Construct folder path
    const folderPath = cleanParentPath 
      ? `${cleanParentPath}/${cleanFolderName}`
      : cleanFolderName;
    
    const gcsPath = `${userId}/${folderPath}/`;

    // Create placeholder file in GCS to represent the folder
    const file = bucket.file(gcsPath + '.keep');
    await file.save('', { resumable: false });

    // Save folder metadata to database
    await File.create({
      user_id: userId,
      originalname: cleanFolderName,
      gcs_path: gcsPath,
      folder_path: cleanParentPath || null,
      mimetype: 'folder',
      size: 0,
      is_folder: true,
    });

    return res.status(201).json({ 
      message: 'Folder created successfully', 
      path: folderPath 
    });
  } catch (error) {
    console.error('❌ Error creating folder:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// List user files with folder structure
const listUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await File.findByUserId(userId);

    // Build folder structure
    const buildFolderStructure = (fileList) => {
      const root = { name: 'root', type: 'folder', children: [] };
      const nodeMap = new Map();
      nodeMap.set('', root);

      // Sort files to process folders first
      const sortedFiles = fileList.sort((a, b) => {
        if (a.is_folder && !b.is_folder) return -1;
        if (!a.is_folder && b.is_folder) return 1;
        return 0;
      });

      sortedFiles.forEach(file => {
        const folderPath = file.folder_path || '';
        let currentNode = root;

        // Navigate to the correct parent folder
        if (folderPath) {
          const pathParts = folderPath.split('/').filter(p => p);
          let currentPath = '';
          
          pathParts.forEach(part => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            
            if (!nodeMap.has(currentPath)) {
              const folderNode = {
                name: part,
                type: 'folder',
                folder_path: currentPath,
                children: [],
                documentCount: 0,
                isFolder: true
              };
              currentNode.children.push(folderNode);
              nodeMap.set(currentPath, folderNode);
            }
            currentNode = nodeMap.get(currentPath);
          });
        }

        // Add the file or folder
        if (file.is_folder) {
          const fullPath = folderPath ? `${folderPath}/${file.originalname}` : file.originalname;
          if (!nodeMap.has(fullPath)) {
            const folderNode = {
              id: file.id,
              name: file.originalname,
              type: 'folder',
              folder_path: fullPath,
              children: [],
              documentCount: 0,
              isFolder: true
            };
            currentNode.children.push(folderNode);
            nodeMap.set(fullPath, folderNode);
          }
        } else {
          currentNode.children.push({
            id: file.id,
            name: file.originalname,
            type: 'file',
            gcs_path: file.gcs_path,
            folder_path: file.folder_path,
            mimetype: file.mimetype,
            size: file.size,
            created_at: file.created_at,
            isFolder: false
          });
        }
      });

      // Calculate document counts
      const calculateDocumentCounts = (node) => {
        let count = 0;
        if (node.children) {
          node.children.forEach(child => {
            if (child.type === 'file') {
              count++;
            } else if (child.type === 'folder') {
              count += calculateDocumentCounts(child);
            }
          });
          if (node.type === 'folder') {
            node.documentCount = count;
          }
        }
        return count;
      };

      calculateDocumentCounts(root);
      return root.children;
    };

    // Add signed URLs for files
    const filesWithSignedUrls = await Promise.all(files.map(async (file) => {
      if (!file.is_folder && file.gcs_path) {
        try {
          const signedUrl = await getSignedUrlForFile(file.gcs_path);
          return { ...file, signedUrl };
        } catch (error) {
          console.error('Error generating signed URL:', error);
          return file;
        }
      }
      return file;
    }));

    const structuredFiles = buildFolderStructure(filesWithSignedUrls);

    res.status(200).json(structuredFiles);
  } catch (error) {
    console.error('Error listing user files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// List contents of a specific folder
const listFolderContents = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderPath = req.query.path || '';
    
    // Clean the folder path
    const cleanFolderPath = folderPath.replace(/^\/+|\/+$/g, '');
    
    // Get files from database for this specific folder
    const files = await File.findByUserIdAndFolderPath(userId, cleanFolderPath);
    
    const folderItems = [];

    // Add signed URLs and format response
    for (const file of files) {
      if (file.is_folder) {
        folderItems.push({
          id: file.id,
          name: file.originalname,
          isFolder: true,
          path: cleanFolderPath ? `${cleanFolderPath}/${file.originalname}` : file.originalname,
          size: null,
          type: 'folder',
          url: null
        });
      } else {
        try {
          const signedUrl = await getSignedUrlForFile(file.gcs_path);
          folderItems.push({
            id: file.id,
            name: file.originalname,
            isFolder: false,
            path: file.gcs_path,
            size: file.size,
            type: file.mimetype,
            url: signedUrl,
            created_at: file.created_at
          });
        } catch (error) {
          console.error('Error generating signed URL:', error);
          folderItems.push({
            id: file.id,
            name: file.originalname,
            isFolder: false,
            path: file.gcs_path,
            size: file.size,
            type: file.mimetype,
            url: null,
            created_at: file.created_at
          });
        }
      }
    }

    res.json({
      folderPath: cleanFolderPath,
      items: folderItems,
    });
  } catch (error) {
    console.error('Error listing folder contents:', error);
    res.status(500).json({ message: 'Failed to list folder contents' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file || file.user_id !== userId) {
      return res.status(404).json({ message: 'File not found or unauthorized' });
    }

    // Delete from GCS
    if (file.gcs_path) {
      try {
        await bucket.file(file.gcs_path).delete();
      } catch (gcsError) {
        console.error('Error deleting from GCS:', gcsError);
        // Continue with database deletion even if GCS deletion fails
      }
    }

    // Delete from database
    await File.delete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user files (simple list)
const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await File.findByUserId(userId);

    // Filter only actual files (not folders)
    const actualFiles = files.filter(file => !file.is_folder);

    // Generate signed URLs
    const signedFiles = await Promise.all(
      actualFiles.map(async (file) => {
        try {
          const signedUrl = await getSignedUrlForFile(file.gcs_path);
          return {
            id: file.id,
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            created_at: file.created_at,
            folder_path: file.folder_path,
            url: signedUrl,
          };
        } catch (error) {
          console.error('Error generating signed URL:', error);
          return {
            id: file.id,
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            created_at: file.created_at,
            folder_path: file.folder_path,
            url: null,
          };
        }
      })
    );

    return res.status(200).json({ files: signedFiles });
  } catch (error) {
    console.error('Error fetching user files:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Upload files to specific folder
const uploadToFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderPath = '' } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const cleanFolderPath = folderPath ? folderPath.replace(/^\/+|\/+$/g, '') : '';
    const uploaded = [];

    for (const file of req.files) {
      const gcsPath = cleanFolderPath 
        ? `${userId}/${cleanFolderPath}/${file.originalname}`
        : `${userId}/${file.originalname}`;

      const blob = bucket.file(gcsPath);
      
      await new Promise((resolve, reject) => {
        const stream = blob.createWriteStream({ 
          resumable: false, 
          metadata: { contentType: file.mimetype } 
        });
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      const dbFile = await File.create({
        user_id: userId,
        originalname: file.originalname,
        gcs_path: gcsPath,
        folder_path: cleanFolderPath || null,
        mimetype: file.mimetype,
        size: file.size,
      });

      uploaded.push({ 
        id: dbFile.id,
        name: file.originalname, 
        path: gcsPath,
        folder_path: cleanFolderPath
      });
    }

    res.status(201).json({ 
      message: 'Files uploaded successfully', 
      files: uploaded 
    });
  } catch (error) {
    console.error('❌ Error uploading to folder:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

module.exports = { 
  uploadFile, 
  uploadFolder, 
  listUserFiles, 
  deleteFile, 
  getUserFiles, 
  createFolder,
  uploadToFolder,
  listFolderContents,
  getFileChatHistory,
  continueFileChat
};

// Fetch chat history for a file
async function getFileChatHistory(req, res) {
  try {
    const { fileId } = req.params;
    const { sessionId } = req.query; // Get sessionId from query parameters
    const userId = req.user.id;

    // Optional: Verify file ownership
    const file = await File.findById(fileId);
    if (!file || file.user_id !== userId) {
      return res.status(404).json({ message: 'File not found or unauthorized.' });
    }

    const chatHistory = await FileChat.getChatHistory(fileId, sessionId); // Pass sessionId
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error('❌ Error fetching file chat history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Continue chat with a file
async function continueFileChat(req, res) {
  try {
    const { fileId } = req.params;
    const { question, sessionId } = req.body; // Get sessionId from body
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    // Verify file ownership
    const file = await File.findById(fileId);
    if (!file || file.user_id !== userId) {
      return res.status(404).json({ message: 'File not found or unauthorized.' });
    }

    // Fetch relevant chunks for the file
    const fileChunks = await FileChunk.findByFileId(fileId);
    if (fileChunks.length === 0) {
      return res.status(404).json({ message: 'No content found for this file to chat with.' });
    }

    // Combine chunk content for AI
    const documentContent = fileChunks.map(chunk => chunk.content).join('\n\n');

    // Get chat history to provide context to the AI
    const chatHistory = await FileChat.getChatHistory(fileId);
    const formattedChatHistory = chatHistory.flatMap(chat => [
      {
        role: 'user',
        parts: [{ text: chat.question }],
      },
      {
        role: 'model',
        parts: [{ text: chat.answer }],
      }
    ]);

    // Ask Gemini a question with document content and chat history
    // The askGemini function in aiService.js needs to be updated to accept history
    const aiAnswer = await askGemini(documentContent, question, formattedChatHistory);

    // Save the new chat turn, passing the sessionId
    const savedChat = await FileChat.saveChat(fileId, userId, question, aiAnswer, sessionId);

    res.status(200).json({ answer: aiAnswer, sessionId: savedChat.session_id });
  } catch (error) {
    console.error('❌ Error continuing file chat:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// New controller function to get all chats for a user
const getAllUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatHistory = await FileChat.getChatHistoryByUserId(userId);
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error('❌ Error fetching all user chats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  uploadFile,
  uploadFolder,
  listUserFiles,
  deleteFile,
  getUserFiles,
  createFolder,
  uploadToFolder,
  listFolderContents,
  getFileChatHistory,
  continueFileChat,
  getAllUserChats // Export the new controller function
};
