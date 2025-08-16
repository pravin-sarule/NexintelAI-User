const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(fileBuffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error('Unsupported file type for text extraction');
}

module.exports = { extractText };