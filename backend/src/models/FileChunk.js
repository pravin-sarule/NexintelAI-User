const pool = require('../config/db');

const FileChunk = {
  async saveChunk(fileId, chunkIndex, content, tokenCount) {
    const res = await pool.query(`
      INSERT INTO file_chunks (file_id, chunk_index, content, token_count)
      VALUES ($1::uuid, $2, $3, $4)
      RETURNING id
    `, [fileId, chunkIndex, content, tokenCount]);
    return res.rows[0].id;
  },

  async getChunksByFileId(fileId) {
    const res = await pool.query(`
      SELECT id, chunk_index, content, token_count FROM file_chunks
      WHERE file_id = $1::uuid
      ORDER BY chunk_index ASC
    `, [fileId]);
    return res.rows;
  },

  async getChunkContentByIds(chunkIds) {
    const res = await pool.query(`
      SELECT id, content FROM file_chunks
      WHERE id = ANY($1::int[])
      ORDER BY chunk_index ASC
    `, [chunkIds]);
    return res.rows;
  }
};

module.exports = FileChunk;