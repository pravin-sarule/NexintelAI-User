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

  static async update(id, {
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
      `UPDATE users SET
        username = $1,
        email = $2,
        password = $3,
        google_uid = $4,
        auth_type = $5,
        profile_image = $6,
        firebase_uid = $7,
        role = $8,
        is_blocked = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [username, email, password, google_uid, auth_type, profile_image, firebase_uid, role, is_blocked, id]
    );
    return result.rows[0];
  }
}

module.exports = User;
