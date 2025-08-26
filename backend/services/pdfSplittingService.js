const { PDFDocument } = require('pdf-lib');

async function splitPdf(pdfBuffer, maxPagesPerChunk = 10) { // Reduced chunk size for better Document AI reliability
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const { pageCount } = pdfDoc;
  const splitPdfs = [];

  for (let i = 0; i < pageCount; i += maxPagesPerChunk) {
    const newPdf = await PDFDocument.create();
    const endPage = Math.min(i + maxPagesPerChunk, pageCount);
    const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: endPage - i }, (_, k) => i + k));
    pages.forEach((page) => newPdf.addPage(page));
    const newPdfBytes = await newPdf.save();
    splitPdfs.push(newPdfBytes);
  }

  return splitPdfs; // Array of PDF buffers
}

module.exports = { splitPdf };