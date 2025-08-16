// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// const FileChat = {
//   async saveChat(fileId, userId, question, answer, sessionId, usedChunkIds = []) {
//     const currentSessionId = sessionId || uuidv4(); // Generate new session ID if not provided
//     const res = await pool.query(`
//       INSERT INTO file_chats (file_id, user_id, question, answer, session_id, used_chunk_ids)
//       VALUES ($1::uuid, $2, $3, $4, $5, $6)
//       RETURNING id, session_id
//     `, [fileId, userId, question, answer, currentSessionId, usedChunkIds]);
//     return res.rows[0]; // Return both id and session_id
//   },

//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE file_id = $1::uuid
//     `;
//     const params = [fileId];

//     if (sessionId) {
//       query += ` AND session_id = $2`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;

//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   async getChatHistoryByUserId(userId) {
//     const query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at ASC
//     `;
//     const params = [userId];
//     const res = await pool.query(query, params);
//     return res.rows;
//   }
// };

// module.exports = FileChat;

// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// const FileChat = {
//   /**
//    * Save a new chat message for a file
//    * @param {number} fileId - The file's integer ID
//    * @param {number} userId - The user's integer ID
//    * @param {string} question - User's question
//    * @param {string} answer - AI's answer
//    * @param {string|null} sessionId - Optional UUID session ID
//    * @param {Array} usedChunkIds - Optional array of chunk IDs
//    */
//   async saveChat(fileId, userId, question, answer, sessionId = null, usedChunkIds = []) {
//     const currentSessionId = sessionId || uuidv4(); // Always store as UUID
//     const res = await pool.query(
//       `
//       INSERT INTO file_chats (file_id, user_id, question, answer, session_id, used_chunk_ids)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id, session_id
//       `,
//       [fileId, userId, question, answer, currentSessionId, usedChunkIds]
//     );
//     return res.rows[0];
//   },

//   /**
//    * Get chat history for a specific file (and optionally a session)
//    */
//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE file_id = $1
//     `;
//     const params = [fileId];

//     if (sessionId) {
//       query += ` AND session_id = $2`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;

//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   /**
//    * Get all chat history for a specific user
//    */
//   async getChatHistoryByUserId(userId) {
//     const query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at ASC
//     `;
//     const res = await pool.query(query, [userId]);
//     return res.rows;
//   }
// };

// module.exports = FileChat;


// const pool = require('../config/db');
// const { v4: uuidv4 } = require('uuid');

// const FileChat = {
//   async saveChat(fileId, userId, question, answer, sessionId = null, usedChunkIds = []) {
//     const currentSessionId = sessionId || uuidv4(); // keep session as UUID string

//     // ✅ Ensure chunk IDs are integers (important for integer[] column)
//     const chunkIdsInt = Array.isArray(usedChunkIds)
//       ? usedChunkIds.map(id => parseInt(id, 10)).filter(Number.isInteger)
//       : [];

//     const res = await pool.query(
//       `
//       INSERT INTO file_chats (file_id, user_id, question, answer, session_id, used_chunk_ids)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id, session_id
//       `,
//       [parseInt(fileId, 10), parseInt(userId, 10), question, answer, currentSessionId, chunkIdsInt]
//     );

//     return res.rows[0];
//   },

//   async getChatHistory(fileId, sessionId = null) {
//     let query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE file_id = $1
//     `;
//     const params = [parseInt(fileId, 10)];

//     if (sessionId) {
//       query += ` AND session_id = $2`;
//       params.push(sessionId);
//     }

//     query += ` ORDER BY created_at ASC`;

//     const res = await pool.query(query, params);
//     return res.rows;
//   },

//   async getChatHistoryByUserId(userId) {
//     const query = `
//       SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
//       FROM file_chats
//       WHERE user_id = $1
//       ORDER BY created_at ASC
//     `;
//     const params = [parseInt(userId, 10)];
//     const res = await pool.query(query, params);
//     return res.rows;
//   }
// };

// module.exports = FileChat;


const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const FileChat = {
  // Save a new chat
  async saveChat(fileId, userId, question, answer, sessionId, usedChunkIds = []) {
    const currentSessionId = sessionId || uuidv4(); // Generate new session ID if not provided

    const res = await pool.query(
      `
      INSERT INTO file_chats
        (file_id, user_id, question, answer, session_id, used_chunk_ids, created_at)
      VALUES
        ($1::uuid, $2, $3, $4, $5, $6::int[], NOW())
      RETURNING id, session_id
      `,
      [fileId, userId, question, answer, currentSessionId, usedChunkIds]
    );

    return res.rows[0]; // Return both id and session_id
  },

  // Get chat history for a specific file (optionally by session)
  async getChatHistory(fileId, sessionId = null) {
    let query = `
      SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
      FROM file_chats
      WHERE file_id = $1::uuid
    `;
    const params = [fileId];

    if (sessionId) {
      query += ` AND session_id = $2`;
      params.push(sessionId);
    }

    query += ` ORDER BY created_at ASC`;

    const res = await pool.query(query, params);
    return res.rows;
  },

  // Get chat history by user
  async getChatHistoryByUserId(userId) {
    const query = `
      SELECT id, file_id, user_id, question, answer, session_id, used_chunk_ids, created_at
      FROM file_chats
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;
    const params = [userId];
    const res = await pool.query(query, params);
    return res.rows;
  }
};

module.exports = FileChat;

