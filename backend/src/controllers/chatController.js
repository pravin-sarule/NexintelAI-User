const db = require('../config/db'); // PostgreSQL client (pg.Pool)

// @desc    Get all chat data for the logged-in user (all files)
// @route   GET /api/chat
// @access  Private
const getAllChatsForFile = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from JWT token in authenticateToken middleware

    const query = `
      SELECT id, user_id, question, answer, used_chunk_ids, created_at, session_id, file_id
      FROM file_chats
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;
    const { rows } = await db.query(query, [userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No chat found for this user' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a specific chat by chatId and fileId for the logged-in user
// @route   GET /api/chat/history/:fileId/:chatId
// @access  Private
const getSpecificChat = async (req, res) => {
  try {
    const { fileId, chatId } = req.params;
    const userId = req.user.id; // from protect middleware

    const query = `
      SELECT id, user_id, question, answer, used_chunk_ids, created_at, session_id, file_id
      FROM file_chats
      WHERE file_id = $1 AND id = $2 AND user_id = $3
    `;
    const { rows } = await db.query(query, [fileId, chatId, userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Chat not found for this file and chat ID' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching specific chat:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all chat data for the logged-in user
// @route   GET /api/chat
// @access  Private
const getAllUserChats = async (req, res) => {
  try {
    const userId = req.user.id; // from protect middleware

    const query = `
      SELECT id, user_id, question, answer, used_chunk_ids, created_at, session_id, file_id
      FROM file_chats
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;
    const { rows } = await db.query(query, [userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No chat found for this user' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all user chats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAllChatsForFile, getSpecificChat, getAllUserChats };
