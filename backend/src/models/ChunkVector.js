const pool = require('../config/db');

const ChunkVector = {
  async saveChunkVector(chunkId, embedding, fileId) {
    // Convert the embedding array to a PostgreSQL array literal string
    const embeddingString = JSON.stringify(embedding);
    const res = await pool.query(`
      INSERT INTO chunk_vectors (chunk_id, embedding, file_id)
      VALUES ($1, $2, $3::uuid)
      RETURNING id
    `, [chunkId, embeddingString, fileId]);
    return res.rows[0].id;
  },

  async getVectorsByChunkIds(chunkIds) {
    const res = await pool.query(`
      SELECT id, chunk_id, embedding FROM chunk_vectors
      WHERE chunk_id = ANY($1::int[])
    `, [chunkIds]);
    return res.rows;
  },

  async findNearestChunks(embedding, limit = 5, fileId = null) {
    let query = `
      SELECT
        cv.chunk_id,
        cv.embedding,
        fc.content,
        fc.file_id,
        (cv.embedding <=> $1) AS distance
      FROM chunk_vectors cv
      JOIN file_chunks fc ON cv.chunk_id = fc.id
    `;
    const params = [JSON.stringify(embedding), limit];

    if (fileId) {
      query += ` WHERE fc.file_id = $3::uuid`;
      params.push(fileId);
    }

    query += `
      ORDER BY distance ASC
      LIMIT $2
    `;

    const res = await pool.query(query, params);
    return res.rows;
  }
};

module.exports = ChunkVector;