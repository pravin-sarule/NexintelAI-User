

const db = require('../config/db'); // Import db for querying user subscriptions
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
const TokenUsageService = require('../services/tokenUsageService');

const { v4: uuidv4 } = require('uuid');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No file uploaded or invalid file data.' });
    }

    const userId = req.user.id;

    // Check document limit
    const userSubscriptionQuery = `
      SELECT
          sp.document_limit
      FROM
          user_subscriptions us
      JOIN
          subscription_plans sp ON us.plan_id = sp.id
      WHERE
          us.user_id = $1 AND us.status = 'active';
    `;
    const subscriptionResult = await db.query(userSubscriptionQuery, [userId]);

    if (subscriptionResult.rows.length === 0) {
      console.warn(`User ${userId} has no active subscription for document limit check.`);
      return res.status(403).json({ message: 'No active subscription found. Document upload not allowed.' });
    }

    const documentLimit = subscriptionResult.rows[0].document_limit;
    const currentDocumentCount = await DocumentModel.countDocumentsByUserId(userId);

    if (documentLimit !== 0 && currentDocumentCount >= documentLimit) {
      return res.status(403).json({ message: `Document limit of ${documentLimit} reached. Upgrade your plan to upload more documents.` });
    }

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

    // Calculate token cost for document analysis (e.g., 1 token per 500 characters)
    const analysisCost = Math.ceil(fullText.length / 500);

    // Check and reserve tokens
    const tokensReserved = await TokenUsageService.checkAndReserveTokens(req.user.id, analysisCost);
    if (!tokensReserved) {
      return res.status(403).json({ message: 'User token limit is exceeded for document analysis.' });
    }

    let insights;
    try {
      insights = await analyzeWithGemini(fullText);
      // Commit tokens after successful analysis
      await TokenUsageService.commitTokens(req.user.id, analysisCost, `Document analysis for file ${file_id}`);
    } catch (aiError) {
      console.error('❌ Gemini analysis error:', aiError);
      // Rollback tokens if AI analysis fails
      await TokenUsageService.rollbackTokens(req.user.id, analysisCost);
      return res.status(500).json({ error: 'Failed to get AI analysis.', details: aiError.message });
    }

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

    // Calculate token cost for summary generation (e.g., 1 token per 200 characters of combined text)
    const summaryCost = Math.ceil(combinedText.length / 200);

    // Check and reserve tokens
    const tokensReserved = await TokenUsageService.checkAndReserveTokens(userId, summaryCost);
    if (!tokensReserved) {
      return res.status(403).json({ message: 'User token limit is exceeded for summary generation.' });
    }

    let summary;
    try {
      summary = await getSummaryFromChunks(combinedText);
      // Commit tokens after successful summary generation
      await TokenUsageService.commitTokens(userId, summaryCost, `Summary generation for file ${file_id}`);
    } catch (aiError) {
      console.error('❌ Gemini summary error:', aiError);
      // Rollback tokens if summary generation fails
      await TokenUsageService.rollbackTokens(userId, summaryCost);
      return res.status(500).json({ error: 'Failed to generate summary.', details: aiError.message });
    }

    return res.json({ summary, used_chunk_ids: safeChunkIds });
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    return res.status(500).json({ error: 'Failed to generate summary.' });
  }
};


exports.chatWithDocument = async (req, res) => {
  let chatCost; // Declare chatCost here to be accessible in catch block
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

    // Calculate token cost for AI chat (e.g., 1 token per 100 characters of question + document content)
    const chatContentLength = question.length + documentFullText.length;
    chatCost = Math.ceil(chatContentLength / 100); // Example: 1 token per 100 characters

    // Check and reserve tokens
    const tokensReserved = await TokenUsageService.checkAndReserveTokens(userId, chatCost);
    if (!tokensReserved) {
      return res.status(403).json({ message: 'User token limit is exceeded for AI chat.' });
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
      // Commit tokens even if no context was found, as an AI call was still made
      await TokenUsageService.commitTokens(userId, chatCost, `AI chat for document ${file_id} (no context)`);
      return res.json({ answer, used_chunk_ids: [] });
    }

    // Combine relevant chunks as context for Gemini
    const context = relevantChunkContents.join('\n\n');

    // Ask Gemini with context and question
    answer = await askGemini(context, question);

    // Save the Q&A chat with chunk references for traceability
    await FileChatModel.saveChat(file_id, userId, question, answer, null, usedChunkIds);

    // Commit tokens after successful AI interaction
    await TokenUsageService.commitTokens(userId, chatCost, `AI chat for document ${file_id}`);

    // Return answer and chunk ids used
    return res.json({ answer, used_chunk_ids: usedChunkIds });
  } catch (error) {
    console.error('❌ Error chatting with document:', error);
    // Rollback tokens if an error occurs during AI chat
    if (chatCost) { // Only rollback if cost was calculated and reservation attempted
      await TokenUsageService.rollbackTokens(userId, chatCost);
    }
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
