

const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

async function chunkDocument(text, chunkSize = 1000, chunkOverlap = 200) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const output = await splitter.createDocuments([text]);
  return output.map(doc => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    token_count: doc.pageContent.length // Simple token count for now, can be improved
  }));
}

module.exports = {
  chunkDocument
};