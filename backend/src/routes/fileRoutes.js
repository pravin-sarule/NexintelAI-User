


const express = require('express');
const multer = require('multer');
const {
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
  getAllUserChats // Import the new controller function
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// File upload routes
router.post('/upload', protect, upload.any(), uploadFile);
// router.post('/upload', protect, upload.single('file'), uploadFile);
// router.post('/upload', protect, upload.single('file'), uploadFile);
router.post('/upload-folder', protect, upload.array('files'), uploadFolder);
router.post('/upload-to-folder', protect, upload.array('files'), uploadToFolder);

// Folder management routes
router.post('/create-folder', protect, createFolder);
router.get('/list', protect, listFolderContents);

// File listing routes
router.get('/structure', protect, listUserFiles); // Changed from '/' to '/structure'
router.get('/all', protect, getUserFiles); // Changed from '/' to '/all'

// File management routes
router.delete('/:id', protect, deleteFile);

// Save edited document route
router.post('/save-edited', protect, upload.single('file'), uploadFile); // Reusing uploadFile for now, will create a dedicated one if needed

// Chat routes
router.get('/:fileId/chat-history', protect, getFileChatHistory); // Can now accept ?sessionId=...
router.post('/:fileId/chat', protect, continueFileChat); // Can now accept sessionId in body
router.get('/all-chats', protect, getAllUserChats); // New route to get all chats for a user

module.exports = router;
