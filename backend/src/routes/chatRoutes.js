const express = require('express');
const { protect } = require('../middleware/auth');
const { getAllUserChats, getAllChatsForFile, getSpecificChat } = require('../controllers/chatController');

const router = express.Router();

// Get all chats for the logged-in user
router.get('/', protect, getAllUserChats);

// Get all chats for a specific file
router.get('/:fileId', protect, getAllChatsForFile);
router.get('/history/:fileId/:chatId', protect, getSpecificChat);

module.exports = router;
