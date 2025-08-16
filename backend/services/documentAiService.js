// services/documentAiService.js
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const { credentials } = require('../src/config/gcs'); // Import credentials

const projectId = process.env.GCLOUD_PROJECT_ID;
const location = process.env.DOCUMENT_AI_LOCATION || 'us';
const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID; // your OCR processor ID

// Auth with your service account
const client = new DocumentProcessorServiceClient({ credentials }); // Explicitly pass credentials

async function extractTextFromDocument(fileBuffer, mimeType) {
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const request = {
    name,
    rawDocument: {
      content: fileBuffer.toString('base64'),
      mimeType, // e.g. 'application/pdf', 'image/png'
    },
  };

  const [result] = await client.processDocument(request);
  const document = result.document;

  // Join all text segments into one string
  let fullText = '';
  if (document.text) {
    fullText = document.text;
  }

  return fullText;
}

module.exports = { extractTextFromDocument };
