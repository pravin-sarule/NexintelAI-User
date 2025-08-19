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


// const express = require('express');
// const multer = require('multer');
// const {
//   uploadFile,
//   uploadFolder,
//   listUserFiles,
//   deleteFile,
//   getUserFiles,
//   createFolder,
//   uploadToFolder,
//   listFolderContents,
//   getFileChatHistory,
//   continueFileChat,
//   getAllUserChats // Import the new controller function
// } = require('../controllers/fileController');
// const { protect } = require('../middleware/auth');

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // File upload routes
// // router.post('/upload', authenticateToken, upload.any(), uploadFile);
// // router.post('/upload', protect, upload.single('file'), uploadFile);
// router.post('/upload', protect, upload.single('file'), uploadFile);
// router.post('/upload-folder', protect, upload.array('files'), uploadFolder);
// router.post('/upload-to-folder', protect, upload.array('files'), uploadToFolder);

// // Folder management routes
// router.post('/create-folder', protect, createFolder);
// router.get('/list', protect, listFolderContents);

// // File listing routes
// router.get('/structure', protect, listUserFiles); // Changed from '/' to '/structure'
// router.get('/all', protect, getUserFiles); // Changed from '/' to '/all'

// // File management routes
// router.delete('/:id', protect, deleteFile);

// // Save edited document route
// router.post('/save-edited', protect, upload.single('file'), uploadFile); // Reusing uploadFile for now, will create a dedicated one if needed

// // Chat routes
// router.get('/:fileId/chat-history', protect, getFileChatHistory); // Can now accept ?sessionId=...
// router.post('/:fileId/chat', protect, continueFileChat); // Can now accept sessionId in body
// router.get('/all-chats', protect, getAllUserChats); // New route to get all chats for a user

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
  getAllUserChats
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// Debug middleware (optional for logging each route access)
router.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ------------------- File Upload Routes -------------------

// Single file upload (used by document upload or summary requests)
router.post('/upload', protect, upload.single('file'), (req, res, next) => {
  console.log('🔥 /upload route hit');
  console.log('User:', req.user);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  uploadFile(req, res, next);
});

// Multiple file upload as a folder
router.post('/upload-folder', protect, upload.array('files'), (req, res, next) => {
  console.log('🔥 /upload-folder route hit');
  console.log('Files:', req.files);
  uploadFolder(req, res, next);
});

// Upload files to an existing folder
router.post('/upload-to-folder', protect, upload.array('files'), (req, res, next) => {
  console.log('🔥 /upload-to-folder route hit');
  console.log('Files:', req.files);
  uploadToFolder(req, res, next);
});

// ------------------- Folder Management -------------------

router.post('/create-folder', protect, createFolder);
router.get('/list', protect, listFolderContents);

// ------------------- File Listing -------------------

router.get('/structure', protect, listUserFiles);
router.get('/all', protect, getUserFiles);

// ------------------- File Delete -------------------

router.delete('/:id', protect, deleteFile);

// ------------------- Save Edited Document -------------------

router.post('/save-edited', protect, upload.single('file'), (req, res, next) => {
  console.log('🔥 /save-edited route hit');
  console.log('User:', req.user);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  uploadFile(req, res, next); // Reusing same logic for now
});

// ------------------- File Chat Routes -------------------

router.get('/:fileId/chat-history', protect, getFileChatHistory);
router.post('/:fileId/chat', protect, continueFileChat);
router.get('/all-chats', protect, getAllUserChats);

module.exports = router;

