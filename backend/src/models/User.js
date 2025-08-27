const pool = require('../config/db');

class User {
  static async create({
    username,
    email,
    password,
    google_uid = null,
    auth_type = 'manual',
    profile_image = null,
    firebase_uid = null,
    role = 'user',
    is_blocked = false
  }) {
    const result = await pool.query(
      `INSERT INTO users (
        username, email, password, google_uid,
        auth_type, profile_image, firebase_uid,
        role, is_blocked, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [username, email, password, google_uid, auth_type, profile_image, firebase_uid, role, is_blocked]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByGoogleUid(google_uid) {
    const result = await pool.query('SELECT * FROM users WHERE google_uid = $1', [google_uid]);
    return result.rows[0];
  }

  static async findByFirebaseUid(firebase_uid) {
    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
    return result.rows[0];
  }

  static async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const key in fields) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(fields[key]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id); // No fields to update, return current user
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE users SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = User;
