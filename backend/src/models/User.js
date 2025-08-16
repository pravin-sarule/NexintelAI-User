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

// const pool = require('../config/db');

// class User {
//   static async create({ username, email, password, google_uid, auth_type, profile_image, firebase_uid }) {
//     const result = await pool.query(
//       `INSERT INTO users (username, email, password, google_uid, auth_type, profile_image, firebase_uid)
//        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//       [username, email, password, google_uid, auth_type, profile_image, firebase_uid]
//     );
//     return result.rows[0];
//   }

//   static async findByEmail(email) {
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     return result.rows[0];
//   }

//   static async findById(id) {
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//     return result.rows[0];
//   }

//   static async findByGoogleUid(google_uid) {
//     const result = await pool.query('SELECT * FROM users WHERE google_uid = $1', [google_uid]);
//     return result.rows[0];
//   }

//   static async findByFirebaseUid(firebase_uid) {
//     const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
//     return result.rows[0];
//   }

//   static async update(id, { username, email, password, google_uid, auth_type, profile_image, firebase_uid }) {
//     const result = await pool.query(
//       `UPDATE users SET username = $1, email = $2, password = $3, google_uid = $4, auth_type = $5, profile_image = $6, firebase_uid = $7, updated_at = CURRENT_TIMESTAMP
//        WHERE id = $8 RETURNING *`,
//       [username, email, password, google_uid, auth_type, profile_image, firebase_uid, id]
//     );
//     return result.rows[0];
//   }
// }


// module.exports = User;

// const pool = require('../config/db');

// class User {
//   static async create({ first_name, last_name, email, mobile, password, auth_type, profile_image = null }) {
//     const result = await pool.query(
//       `INSERT INTO users (first_name, last_name, email, mobile, password, auth_type, profile_image)
//        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//       [first_name, last_name, email, mobile, password, auth_type, profile_image]
//     );
//     return result.rows[0];
//   }

//   static async findByEmail(email) {
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     return result.rows[0];
//   }

//   static async findById(id) {
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//     return result.rows[0];
//   }

//   static async update(id, { first_name, last_name, email, mobile, password, auth_type, profile_image }) {
//     const result = await pool.query(
//       `UPDATE users
//        SET first_name = $1,
//            last_name = $2,
//            email = $3,
//            mobile = $4,
//            password = $5,
//            auth_type = $6,
//            profile_image = $7,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $8
//        RETURNING *`,
//       [first_name, last_name, email, mobile, password, auth_type, profile_image, id]
//     );
//     return result.rows[0];
//   }
// }

// module.exports = User;
