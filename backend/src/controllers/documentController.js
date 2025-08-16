// // backend/controllers/documentController.js
// const DocumentModel = require('../models/documentModel');
// const FileChunkModel = require('../models/FileChunk');
// const ChunkVectorModel = require('../models/ChunkVector');
// const ProcessingJobModel = require('../models/ProcessingJob');
// const { uploadToGCS } = require('../../services/gcsService');
// const { convertHtmlToDocx, convertHtmlToPdf } = require('../../services/conversionService');
// const { askGemini, analyzeWithGemini, getSummaryFromChunks } = require('../../services/aiService');
// const { extractText } = require('../utils/textExtractor');
// const { extractTextFromDocument } = require('../../services/documentAiService');
// const { chunkDocument } = require('../../services/chunkingService');
// const { generateEmbedding, generateEmbeddings } = require('../../services/embeddingService');
// const { v4: uuidv4 } = require('uuid');
// 
// // exports.uploadDocument = async (req, res) => {
// //   try {
// //     const file = req.file;
// //     const userId = req.user.id;
// // 
// //     // Upload to Google Cloud Storage immediately
// //     const { url: gcs_path, path: folder_path } = await uploadToGCS(file.originalname, file.buffer);
// // 
// //     // Save initial file metadata to DB with 'uploaded' status
// //     const fileId = await DocumentModel.saveFileMetadata(
// //       userId,
// //       file.originalname,
// //       gcs_path,
// //       folder_path,
// //       file.mimetype,
// //       file.size
// //     );
// // 
// //     // Start asynchronous processing
// //     processDocument(fileId, file.buffer, file.mimetype, userId);
// // 
// //     res.status(202).json({
// //       file_id: fileId,
// //       message: 'Document uploaded and processing started.',
// //       gcs_path: gcs_path
// //     });
// // 
// //   } catch (error) {
// //     console.error('❌ Upload Error:', error);
// //     res.status(500).json({ error: 'Failed to upload file', details: error.message });
// //   }
// // };
// // 
// // async function processDocument(fileId, fileBuffer, mimetype, userId) {
// //   const jobId = uuidv4();
// //   await ProcessingJobModel.createJob(fileId, jobId);
// //   await DocumentModel.updateFileStatus(fileId, 'processing', 0.00);
// // 
// //   try {
// //     let documentText = '';
// //     const ocrMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'];
// //     const useOCR = ocrMimeTypes.includes(mimetype.toLowerCase());
// // 
// //     if (useOCR) {
// //       console.log(`Using Document AI OCR for file ID ${fileId}`);
// //       documentText = await extractTextFromDocument(fileBuffer, mimetype);
// //     } else {
// //       console.log(`Using standard text extraction for file ID ${fileId}`);
// //       documentText = await extractText(fileBuffer, mimetype);
// //     }
// // 
// //     if (!documentText || typeof documentText !== 'string' || documentText.trim() === '') {
// //       throw new Error('Could not extract text from document.');
// //     }
// // 
// //     await DocumentModel.updateFileStatus(fileId, 'processing', 25.00);
// // 
// //     // Chunk the document
// //     const chunks = await chunkDocument(documentText);
// //     console.log(`Chunked file ID ${fileId} into ${chunks.length} chunks.`);
// // 
// //     await DocumentModel.updateFileStatus(fileId, 'processing', 50.00);
// // 
// //     // Generate embeddings and save chunks/vectors
// //     const chunkContents = chunks.map(c => c.content);
// //     const embeddings = await generateEmbeddings(chunkContents);
// // 
// //     if (chunks.length !== embeddings.length) {
// //       throw new Error('Mismatch between number of chunks and embeddings generated.');
// //     }
// // 
// //     for (let i = 0; i < chunks.length; i++) {
// //       const chunk = chunks[i];
// //       const embedding = embeddings[i];
// //       const chunkId = await FileChunkModel.saveChunk(
// //         fileId,
// //         i, // chunk_index
// //         chunk.content,
// //         chunk.token_count
// //       );
// //       await ChunkVectorModel.saveChunkVector(chunkId, embedding);
// //     }
// // 
// //     await DocumentModel.updateFileStatus(fileId, 'processing', 75.00);
// // 
// //     // Update file status to processed
// //     await DocumentModel.updateFileProcessedAt(fileId);
// //     await ProcessingJobModel.updateJobStatus(jobId, 'completed');
// //     console.log(`✅ Document ID ${fileId} processed successfully.`);
// // 
// //   } catch (error) {
// //     console.error(`❌ Error processing document ID ${fileId}:`, error);
// //     await DocumentModel.updateFileStatus(fileId, 'error', 0.00);
// //     await ProcessingJobModel.updateJobStatus(jobId, 'failed', error.message);
// //   }
// // }
// // 
// // exports.analyzeDocument = async (req, res) => {
// //   const { file_id } = req.body;
// //   const file = await DocumentModel.getFileById(file_id);
// // 
// //   if (!file) {
// //     return res.status(404).json({ error: 'File not found.' });
// //   }
// // 
// //   if (file.status !== 'processed') {
// //     return res.status(400).json({ error: 'Document is still processing or failed.', status: file.status, progress: file.processing_progress });
// //   }
// // 
// //   // For general analysis, we might still use the full text or a selection of chunks.
// //   // For now, let's assume analyzeWithGemini can handle a large text.
// //   // In a full RAG system, this would involve querying chunks.
// //   const chunks = await FileChunkModel.getChunksByFileId(file_id);
// //   const fullText = chunks.map(c => c.content).join('\n\n');
// // 
// //   const insights = await analyzeWithGemini(fullText);
// //   res.json(insights);
// // };
// // 
// // exports.getSummary = async (req, res) => {
// //   const { file_id, selected_chunk_ids } = req.body;
// //   const userId = req.user.id;
// // 
// //   const file = await DocumentModel.getFileById(file_id);
// //   if (!file || file.user_id !== userId) {
// //     return res.status(403).json({ error: 'Access denied or file not found.' });
// //   }
// // 
// //   if (file.status !== 'processed') {
// //     return res.status(400).json({ error: 'Document is still processing or failed.', status: file.status, progress: file.processing_progress });
// //   }
// // 
// //   if (!selected_chunk_ids || !Array.isArray(selected_chunk_ids) || selected_chunk_ids.length === 0) {
// //     return res.status(400).json({ error: 'No chunks selected for summary.' });
// //   }
// // 
// //   const selectedChunks = await FileChunkModel.getChunkContentByIds(selected_chunk_ids);
// //   const combinedText = selectedChunks.map(chunk => chunk.content).join('\n\n');
// // 
// //   if (!combinedText.trim()) {
// //     return res.status(400).json({ error: 'Selected chunks contain no readable content.' });
// //   }
// // 
// //   try {
// //     const summary = await getSummaryFromChunks(combinedText);
// //     res.json({ summary });
// //   } catch (error) {
// //     console.error('Error generating summary:', error);
// //     res.status(500).json({ error: 'Failed to generate summary.' });
// //   }
// // };
// // 
// // exports.chatWithDocument = async (req, res) => {
// //   const { file_id, question } = req.body;
// //   const userId = req.user.id;
// // 
// //   const file = await DocumentModel.getFileById(file_id);
// //   if (!file || file.user_id !== userId) {
// //     return res.status(403).json({ error: 'Access denied or file not found.' });
// //   }
// // 
// //   if (file.status !== 'processed') {
// //     return res.status(400).json({ error: 'Document is still processing or failed.', status: file.status, progress: file.processing_progress });
// //   }
// // 
// //   try {
// //     // Generate embedding for the question
// //     const questionEmbedding = await generateEmbedding(question);
// // 
// //     // Find relevant chunks based on the question embedding
// //     const relevantChunks = await ChunkVectorModel.findNearestChunks(questionEmbedding, 5); // Get top 5 relevant chunks
// //     const relevantChunkContents = relevantChunks.map(rc => rc.content);
// //     const usedChunkIds = relevantChunks.map(rc => rc.chunk_id);
// // 
// //     if (relevantChunkContents.length === 0) {
// //       // Fallback if no relevant chunks found, or respond differently
// //       const answer = await askGemini("No relevant document content found.", question);
// //       await DocumentModel.saveChat(file_id, userId, question, answer, []);
// //       return res.json({ answer, used_chunk_ids: [] });
// //     }
// // 
// //     const context = relevantChunkContents.join('\n\n');
// //     const answer = await askGemini(context, question);
// // 
// //     await DocumentModel.saveChat(file_id, userId, question, answer, usedChunkIds);
// //     res.json({ answer, used_chunk_ids: usedChunkIds });
// // 
// //   } catch (error) {
// //     console.error('❌ Error chatting with document:', error);
// //     res.status(500).json({ error: 'Failed to get AI answer.', details: error.message });
// //   }
// // };
// // 
// // exports.saveEditedDocument = async (req, res) => {
// //   const { file_id, edited_html } = req.body;
// //   const docxBuffer = await convertHtmlToDocx(edited_html);
// //   const pdfBuffer = await convertHtmlToPdf(edited_html);
// //   const { url: docxUrl } = await uploadToGCS(`edited_${file_id}.docx`, docxBuffer, 'edited');
// //   const { url: pdfUrl } = await uploadToGCS(`edited_${file_id}.pdf`, pdfBuffer, 'edited');
// //   await DocumentModel.saveEditedVersions(file_id, docxUrl, pdfUrl);
// //   res.json({ docx_download_url: docxUrl, pdf_download_url: pdfUrl });
// // };
// // 
// // const { getSignedUrl } = require('../../services/gcsService');
// // 
// // exports.downloadDocument = async (req, res) => {
// //   const { file_id, format } = req.params;
// //   const file = await DocumentModel.getFileById(file_id);
// // 
// //   // Ensure user owns the file
// //   if (file.user_id !== req.user.id) {
// //     return res.status(403).json({ error: 'Access denied' });
// //   }
// // 
// //   // Determine GCS path
// //   const gcsPath = format === 'docx'
// //     ? file.edited_docx_path?.split('/').slice(-2).join('/')
// //     : file.edited_pdf_path?.split('/').slice(-2).join('/');
// // 
// //   if (!gcsPath) {
// //     return res.status(404).json({ error: 'File not found or not yet generated' });
// //   }
// // 
// //   // Generate new signed URL
// //   try {
// //     const signedUrl = await getSignedUrl(gcsPath);
// //     return res.redirect(signedUrl);
// //   } catch (error) {
// //     console.error("Error generating signed URL:", error);
// //     return res.status(500).json({ error: 'Failed to generate signed download link' });
// //   }
// // };
// // 
// // exports.getChatHistory = async (req, res) => {
// //   const { file_id } = req.params;
// //   const userId = req.user.id;
// // 
// //   const file = await DocumentModel.getFileById(file_id);
// //   if (!file || file.user_id !== userId) {
// //     return res.status(403).json({ error: 'Access denied or file not found.' });
// //   }
// //  
// //      const chats = await DocumentModel.getChatHistory(file_id);
// //      return res.json(chats);
// //    } catch (error) {
// //      console.error('❌ getChatHistory error:', error);
// //      return res.status(500).json({ error: 'Failed to fetch chat history.' });
// //    }
// //  };
// // 
// // exports.getDocumentProcessingStatus = async (req, res) => {
// //   const { file_id } = req.params;
// //   const userId = req.user.id;
// // 
// //   const file = await DocumentModel.getFileById(file_id);
// //   if (!file || file.user_id !== userId) {
// //     return res.status(403).json({ error: 'Access denied or file not found.' });
// //   }
// // 
// //   const job = await ProcessingJobModel.getJobByFileId(file_id);
// // 
// //   res.json({
//     job_error: job ? job.error_message : null,
//     last_updated: file.updated_at
//   });
// };


// backend/controllers/documentController.js
const DocumentModel = require('../models/documentModel');
const FileChunkModel = require('../models/FileChunk');
const ChunkVectorModel = require('../models/ChunkVector');
const ProcessingJobModel = require('../models/ProcessingJob');
const FileChatModel = require('../models/FileChat');
const { validate: isUuid } = require('uuid');
const { uploadToGCS, getSignedUrl } = require('../../services/gcsService');
const { convertHtmlToDocx, convertHtmlToPdf } = require('../../services/conversionService');
const { askGemini, analyzeWithGemini, getSummaryFromChunks } = require('../../services/aiService');
const { extractText } = require('../utils/textExtractor');
const { extractTextFromDocument } = require('../../services/documentAiService');
const { chunkDocument } = require('../../services/chunkingService');
const { generateEmbedding, generateEmbeddings } = require('../../services/embeddingService');
const { normalizeGcsKey } = require('../utils/gcsKey');

const { v4: uuidv4 } = require('uuid');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No file uploaded or invalid file data.' });
    }

    const userId = req.user.id;

    // Upload to GCS immediately
    const { url: gcs_path, path: folder_path } = await uploadToGCS(file.originalname, file.buffer);

    // Save initial file metadata with 'uploaded' status and 0%
    const fileId = await DocumentModel.saveFileMetadata(
      userId,
      file.originalname,
      gcs_path,
      folder_path,
      file.mimetype,
      file.size
    );

    // Start async processing (fire-and-forget)
    processDocument(fileId, file.buffer, file.mimetype, userId).catch((e) =>
      console.error('Background processing error:', e)
    );

    return res.status(202).json({
      file_id: fileId,
      message: 'Document uploaded; processing started.',
      gcs_path
    });
  } catch (error) {
    console.error('❌ Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
};

async function processDocument(fileId, fileBuffer, mimetype, userId) {
  const jobId = uuidv4();
  await ProcessingJobModel.createJob(fileId, jobId);
  await DocumentModel.updateFileStatus(fileId, 'processing', 0.0);

  try {
    let documentText = '';
    const ocrMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'];
    const useOCR = Boolean(mimetype && ocrMimeTypes.includes(String(mimetype).toLowerCase()));

    if (useOCR) {
      console.log(`Using Document AI OCR for file ID ${fileId}`);
      documentText = await extractTextFromDocument(fileBuffer, mimetype);
    } else {
      console.log(`Using standard text extraction for file ID ${fileId}`);
      documentText = await extractText(fileBuffer, mimetype);
    }

    if (!documentText || typeof documentText !== 'string' || documentText.trim() === '') {
      throw new Error('Could not extract text from document.');
    }

    await DocumentModel.updateFileStatus(fileId, 'processing', 25.0);
    await DocumentModel.updateFileFullTextContent(fileId, documentText);

    // Chunk the document
    const chunks = await chunkDocument(documentText);
    console.log(`Chunked file ID ${fileId} into ${chunks.length} chunks.`);
    await DocumentModel.updateFileStatus(fileId, 'processing', 50.0);

    // Generate embeddings and save chunks/vectors
    const chunkContents = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkContents);

    if (chunks.length !== embeddings.length) {
      throw new Error('Mismatch between number of chunks and embeddings generated.');
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      const chunkId = await FileChunkModel.saveChunk(
        fileId,
        i, // chunk_index
        chunk.content,
        chunk.token_count
      );

      await ChunkVectorModel.saveChunkVector(chunkId, embedding, fileId);
    }

    await DocumentModel.updateFileStatus(fileId, 'processing', 75.0);

    // Finalize
    await DocumentModel.updateFileProcessedAt(fileId);
    await DocumentModel.updateFileStatus(fileId, 'processed', 100.0);
    await ProcessingJobModel.updateJobStatus(jobId, 'completed');

    console.log(`✅ Document ID ${fileId} processed successfully.`);
  } catch (error) {
    console.error(`❌ Error processing document ID ${fileId}:`, error);
    await DocumentModel.updateFileStatus(fileId, 'error', 0.0);
    await ProcessingJobModel.updateJobStatus(jobId, 'failed', error.message);
  }
}

exports.analyzeDocument = async (req, res) => {
  try {
    const { file_id } = req.body;
    if (!file_id) return res.status(400).json({ error: 'file_id is required.' });

    const file = await DocumentModel.getFileById(file_id);
    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (file.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });

    if (file.status !== 'processed') {
      return res.status(400).json({
        error: 'Document is still processing or failed.',
        status: file.status,
        progress: file.processing_progress
      });
    }

    const chunks = await FileChunkModel.getChunksByFileId(file_id);
    const fullText = chunks.map((c) => c.content).join('\n\n');

    const insights = await analyzeWithGemini(fullText);
    return res.json(insights);
  } catch (error) {
    console.error('❌ analyzeDocument error:', error);
    return res.status(500).json({ error: 'Failed to analyze document.' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { file_id, selected_chunk_ids } = req.body;
    const userId = req.user.id;

    if (!file_id) return res.status(400).json({ error: 'file_id is required.' });
    if (!Array.isArray(selected_chunk_ids) || selected_chunk_ids.length === 0) {
      return res.status(400).json({ error: 'No chunks selected for summary.' });
    }

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied or file not found.' });
    }

    if (file.status !== 'processed') {
      return res.status(400).json({
        error: 'Document is still processing or failed.',
        status: file.status,
        progress: file.processing_progress
      });
    }

    // Ensure selected chunks belong to this file
    const fileChunks = await FileChunkModel.getChunksByFileId(file_id);
    const allowedIds = new Set(fileChunks.map((c) => c.id));
    const safeChunkIds = selected_chunk_ids.filter((id) => allowedIds.has(id));

    if (safeChunkIds.length === 0) {
      return res.status(400).json({ error: 'Selected chunks are invalid for this file.' });
    }

    const selectedChunks = await FileChunkModel.getChunkContentByIds(safeChunkIds);
    const combinedText = selectedChunks.map((chunk) => chunk.content).join('\n\n');

    if (!combinedText.trim()) {
      return res.status(400).json({ error: 'Selected chunks contain no readable content.' });
    }

    const summary = await getSummaryFromChunks(combinedText);
    return res.json({ summary, used_chunk_ids: safeChunkIds });
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    return res.status(500).json({ error: 'Failed to generate summary.' });
  }
};

// exports.chatWithDocument = async (req, res) => {
//   try {
//     const { file_id, question } = req.body;
//     const userId = req.user.id;

//     if (!file_id || !question) {
//       return res.status(400).json({ error: 'file_id and question are required.' });
//     }

//     const file = await DocumentModel.getFileById(file_id);
//     if (!file || file.user_id !== userId) {
//       return res.status(403).json({ error: 'Access denied or file not found.' });
//     }

//     if (file.status !== 'processed') {
//       return res.status(400).json({
//         error: 'Document is still processing or failed.',
//         status: file.status,
//         progress: file.processing_progress
//       });
//     }

//     // Generate embedding for the question
//     const questionEmbedding = await generateEmbedding(question);

//     // IMPORTANT: scope to this file_id to prevent cross-file leakage
//     const relevant = await ChunkVectorModel.findNearestChunks(questionEmbedding, 5, file_id);
//     const relevantChunkContents = relevant.map((rc) => rc.content);
//     const usedChunkIds = relevant.map((rc) => rc.chunk_id);

//     let answer;
//     if (relevantChunkContents.length === 0) {
//       // Fallback: answer without context, but clearly state limitation in the prompt
//       answer = await askGemini('No relevant context found in the document.', question);
//       await DocumentModel.saveChat(file_id, userId, question, answer, []);
//       return res.json({ answer, used_chunk_ids: [] });
//     }

//     const context = relevantChunkContents.join('\n\n');
//     answer = await askGemini(context, question);

//     await DocumentModel.saveChat(file_id, userId, question, answer, usedChunkIds);
//     return res.json({ answer, used_chunk_ids: usedChunkIds });
//   } catch (error) {
//     console.error('❌ Error chatting with document:', error);
//     return res.status(500).json({ error: 'Failed to get AI answer.', details: error.message });
//   }
// };
exports.chatWithDocument = async (req, res) => {
  try {
    const { file_id, question } = req.body;
    const userId = req.user.id;

    // Validate input
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!file_id || !question) {
      return res.status(400).json({ error: 'file_id and question are required.' });
    }
    if (!uuidRegex.test(file_id)) {
      console.warn(`Invalid file_id format received: ${file_id}. Expected UUID.`);
      return res.status(400).json({ error: 'Invalid file ID format. Please provide a valid UUID.' });
    }

    // Fetch the file metadata and check ownership & status
    // const file = await DocumentModel.getFileById(file_id);
    // if (!file) {
    //   console.warn(`File with ID ${file_id} not found for user ${userId}.`);
    //   return res.status(404).json({ error: 'File not found.' });
    // }
    // if (file.user_id !== userId) {
    //   console.warn(`Access denied: User ${userId} attempted to access file ${file_id} owned by ${file.user_id}.`);
    //   return res.status(403).json({ error: 'Access denied.' });
    // }

    // if (file.status !== 'processed') {
    //   return res.status(400).json({
    //     error: 'Document is still processing or failed.',
    //     status: file.status,
    //     progress: file.processing_progress,
    //   });
    // }

    // Fetch the file metadata and check ownership & status
    const file = await DocumentModel.getFileById(file_id);
    if (!file) {
      console.warn(`File with ID ${file_id} not found for user ${userId}.`);
      return res.status(404).json({ error: 'File not found.' });
    }
    if (file.user_id !== userId) {
      console.warn(`Access denied: User ${userId} attempted to access file ${file_id} owned by ${file.user_id}.`);
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (file.status !== 'processed') {
      return res.status(400).json({
        error: 'Document is still processing or failed.',
        status: file.status,
        progress: file.processing_progress,
      });
    }

    // Check if file has full_text_content, if not, try to get it from chunks
    let documentFullText = file.full_text_content;
    if (!documentFullText) {
      console.warn(`File ${file_id} missing full_text_content. Attempting to reconstruct from chunks.`);
      const chunks = await FileChunkModel.getChunksByFileId(file_id);
      documentFullText = chunks.map(c => c.content).join('\n\n');
    }

    if (!documentFullText || typeof documentFullText !== 'string' || documentFullText.trim() === '') {
      console.error(`File ${file_id} has no readable content for chat.`);
      return res.status(400).json({ error: 'Document has no readable content for chat.' });
    }

    // Generate embedding for the user's question
    const questionEmbedding = await generateEmbedding(question);

    // Query vector DB to get nearest chunks from this document only (file_id scope)
    const relevantChunks = await ChunkVectorModel.findNearestChunks(questionEmbedding, 5, file_id);

    // Extract chunk texts and their IDs
    const relevantChunkContents = relevantChunks.map((chunk) => chunk.content);
    const usedChunkIds = relevantChunks.map((chunk) => chunk.chunk_id);

    let answer;
    if (relevantChunkContents.length === 0) {
      // Fallback: answer without context, but clearly state limitation in the prompt
      answer = await askGemini('No relevant context found in the document.', question);
      await DocumentModel.saveChat(file_id, userId, question, answer, []);
      return res.json({ answer, used_chunk_ids: [] });
    }

    // Combine relevant chunks as context for Gemini
    const context = relevantChunkContents.join('\n\n');

    // Ask Gemini with context and question
    answer = await askGemini(context, question);

    // Save the Q&A chat with chunk references for traceability
    await FileChatModel.saveChat(file_id, userId, question, answer, null, usedChunkIds);

    // Return answer and chunk ids used
    return res.json({ answer, used_chunk_ids: usedChunkIds });
  } catch (error) {
    console.error('❌ Error chatting with document:', error);
    return res.status(500).json({ error: 'Failed to get AI answer.', details: error.message });
  }
};

exports.saveEditedDocument = async (req, res) => {
  try {
    const { file_id, edited_html } = req.body;
    if (!file_id || typeof edited_html !== 'string') {
      return res.status(400).json({ error: 'file_id and edited_html are required.' });
    }

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied or file not found.' });
    }

    const docxBuffer = await convertHtmlToDocx(edited_html);
    const pdfBuffer = await convertHtmlToPdf(edited_html);

    const { url: docxUrl } = await uploadToGCS(`edited_${file_id}.docx`, docxBuffer, 'edited');
    const { url: pdfUrl } = await uploadToGCS(`edited_${file_id}.pdf`, pdfBuffer, 'edited');

    await DocumentModel.saveEditedVersions(file_id, docxUrl, pdfUrl);

    return res.json({ docx_download_url: docxUrl, pdf_download_url: pdfUrl });
  } catch (error) {
    console.error('❌ saveEditedDocument error:', error);
    return res.status(500).json({ error: 'Failed to save edited document.' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const { file_id, format } = req.params;
    if (!file_id || !format) return res.status(400).json({ error: 'file_id and format are required.' });
    if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ error: 'Invalid format. Use docx or pdf.' });

    const file = await DocumentModel.getFileById(file_id);
    if (!file) return res.status(404).json({ error: 'File not found.' });
    if (file.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const targetUrl = format === 'docx' ? file.edited_docx_path : file.edited_pdf_path;
    if (!targetUrl) return res.status(404).json({ error: 'File not found or not yet generated' });

    // Derive bucket key safely
    const gcsKey = normalizeGcsKey(targetUrl, process.env.GCS_BUCKET);
    if (!gcsKey) return res.status(500).json({ error: 'Invalid GCS path for the file.' });

    const signedUrl = await getSignedUrl(gcsKey);
    return res.redirect(signedUrl);
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    return res.status(500).json({ error: 'Failed to generate signed download link' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) return res.status(400).json({ error: 'file_id is required.' });

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied or file not found.' });
    }
 
     const chats = await FileChatModel.getChatHistory(file_id);
     return res.json(chats);
   } catch (error) {
     console.error('❌ getChatHistory error:', error);
     return res.status(500).json({ error: 'Failed to fetch chat history.' });
   }
 };

exports.getDocumentProcessingStatus = async (req, res) => {
  try {
    const { file_id } = req.params;
    if (!file_id) return res.status(400).json({ error: 'file_id is required.' });

    const file = await DocumentModel.getFileById(file_id);
    if (!file || file.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied or file not found.' });
    }

    const job = await ProcessingJobModel.getJobByFileId(file_id);

    return res.json({
      file_id: file.id,
      status: file.status,
      processing_progress: file.processing_progress,
      job_status: job ? job.status : 'not_queued',
      job_error: job ? job.error_message : null,
      last_updated: file.updated_at
    });
  } catch (error) {
    console.error('❌ getDocumentProcessingStatus error:', error);
    return res.status(500).json({ error: 'Failed to fetch processing status.' });
  }
};
