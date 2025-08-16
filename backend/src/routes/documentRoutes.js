// const express = require('express');
// const multer = require('multer');
// const router = express.Router();
// const controller = require('../controllers/documentController');

// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/upload', upload.single('file'), controller.uploadDocument);
// router.post('/analyze', controller.analyzeDocument);
// router.post('/chat', controller.chatWithDocument);
// router.post('/save', controller.saveEditedDocument);
// router.get('/download/:document_id/:format', controller.downloadDocument);
// router.get('/chat-history/:document_id', controller.getChatHistory);

// module.exports = router;
// const express = require('express');
// const multer = require('multer');
// const router = express.Router();
// const controller = require('../controllers/documentController');
// const authenticateToken = require('../middleware/auth');

// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/upload', authenticateToken, upload.single('file'), controller.uploadDocument);
// router.post('/analyze', authenticateToken, controller.analyzeDocument);
// router.post('/summary', authenticateToken, controller.getSummary); // New route for summary
// router.post('/chat', authenticateToken, controller.chatWithDocument);
// router.post('/save', authenticateToken, controller.saveEditedDocument);
// router.get('/download/:file_id/:format', authenticateToken, controller.downloadDocument); // Changed to file_id
// router.get('/chat-history/:file_id', authenticateToken, controller.getChatHistory); // Changed to file_id
// router.get('/status/:file_id', authenticateToken, controller.getDocumentProcessingStatus); // New route for processing status

// module.exports = router;

// backend/routes/documentRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

const controller = require('../controllers/documentController');
const authenticateToken = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Upload & processing
router.post('/upload', authenticateToken, upload.any(), controller.uploadDocument);

// Post-processing analytics
router.post('/analyze', authenticateToken, controller.analyzeDocument);

// Summarize selected chunks (RAG-efficient)
router.post('/summary', authenticateToken, controller.getSummary);

// Chat with the document (RAG)
router.post('/chat', authenticateToken, controller.chatWithDocument);

// Save edited (docx + pdf variants)
router.post('/save', authenticateToken, controller.saveEditedDocument);

// Download edited variants via signed URL
router.get('/download/:file_id/:format', authenticateToken, controller.downloadDocument);

// Chat history for a document
router.get('/chat-history/:file_id', authenticateToken, controller.getChatHistory);

// Processing status
router.get('/status/:file_id', authenticateToken, controller.getDocumentProcessingStatus);

module.exports = router;
