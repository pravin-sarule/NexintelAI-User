// const pool = require('../config/db');

// class Session {
//   static async create({ user_id, token }) {
//     const result = await pool.query(
//       `INSERT INTO user_sessions (user_id, token)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [user_id, token]
//     );
//     return result.rows[0];
//   }

//   static async logout(sessionId) {
//     return pool.query(
//       `UPDATE user_sessions
//        SET logout_time = CURRENT_TIMESTAMP
//        WHERE id = $1`,
//       [sessionId]
//     );
//   }
// }

// module.exports = Session;
const pool = require('../config/db');

class Session {
  // Create a new session (on login)
  static async create({ user_id, token }) {
    try {
      const result = await pool.query(
        `INSERT INTO user_sessions (user_id, token)
         VALUES ($1, $2)
         RETURNING *`,
        [user_id, token]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Set logout_time to CURRENT_TIMESTAMP (on logout)
  static async logout(sessionId) {
    try {
      const result = await pool.query(
        `UPDATE user_sessions
         SET logout_time = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [sessionId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating logout time:', error);
      throw error;
    }
  }
}

module.exports = Session;
