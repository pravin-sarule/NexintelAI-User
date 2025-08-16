const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getAllUserChats, getAllChatsForFile, getSpecificChat } = require('../controllers/chatController');

const router = express.Router();

// Get all chats for the logged-in user
router.get('/', authenticateToken, getAllUserChats);

// Get all chats for a specific file
router.get('/:fileId', authenticateToken, getAllChatsForFile);
router.get('/history/:fileId/:chatId', authenticateToken, getSpecificChat);

module.exports = router;
