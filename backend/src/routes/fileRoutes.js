// const express = require('express');
// const multer = require('multer');
// const { uploadFile, uploadFolder, listUserFiles, deleteFile, getUserFiles, createFolder, uploadToFolder,listFolderContents  } = require('../controllers/fileController');
// const authenticateToken = require('../middleware/auth');

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// // router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
// router.post('/upload', authenticateToken,upload.single('files'), uploadFile);
// // router.post('/upload-folder', authenticateToken, upload.single('zipFile'), uploadFolder);
// router.post(
//   '/upload-folder',
//   authenticateToken,
//   upload.array('files'), // 👈 Accept multiple files named "files"
//   uploadFolder
// );
// router.post('/create-folder', authenticateToken, createFolder);
// router.post('/upload-to-folder', authenticateToken, upload.array('files'), uploadToFolder);
// router.get('/list', authenticateToken, listFolderContents);
// router.get('/', authenticateToken, listUserFiles);
// router.delete('/:id', authenticateToken, deleteFile);
// router.get('/', authenticateToken, getUserFiles);


// module.exports = router;


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
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// File upload routes
// router.post('/upload', authenticateToken, upload.any(), uploadFile);
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
router.post('/upload-folder', authenticateToken, upload.array('files'), uploadFolder);
router.post('/upload-to-folder', authenticateToken, upload.array('files'), uploadToFolder);

// Folder management routes
router.post('/create-folder', authenticateToken, createFolder);
router.get('/list', authenticateToken, listFolderContents);

// File listing routes
router.get('/structure', authenticateToken, listUserFiles); // Changed from '/' to '/structure'
router.get('/all', authenticateToken, getUserFiles); // Changed from '/' to '/all'

// File management routes
router.delete('/:id', authenticateToken, deleteFile);

// Save edited document route
router.post('/save-edited', authenticateToken, upload.single('file'), uploadFile); // Reusing uploadFile for now, will create a dedicated one if needed

// Chat routes
router.get('/:fileId/chat-history', authenticateToken, getFileChatHistory); // Can now accept ?sessionId=...
router.post('/:fileId/chat', authenticateToken, continueFileChat); // Can now accept sessionId in body
router.get('/all-chats', authenticateToken, getAllUserChats); // New route to get all chats for a user

module.exports = router;
