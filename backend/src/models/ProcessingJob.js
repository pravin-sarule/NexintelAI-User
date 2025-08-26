
const pool = require('../config/db');

const ProcessingJob = {
  async createJob(fileId, jobId) {
    const res = await pool.query(
      `
      INSERT INTO processing_jobs (file_id, job_id, status)
      VALUES ($1, $2, 'queued')
      RETURNING id
      `,
      [fileId, jobId] // fileId is a UUID string
    );
    return res.rows[0].id;
  },

  async updateJobStatus(jobId, status, errorMessage = null) {
    await pool.query(
      `
      UPDATE processing_jobs
      SET status = $1, error_message = $2, updated_at = NOW()
      WHERE job_id = $3
      `,
      [status, errorMessage, jobId]
    );
  },

  async updateProcessingProgress(jobId, progress) {
    await pool.query(
      `
      UPDATE processing_jobs
      SET processing_progress = $1, updated_at = NOW()
      WHERE job_id = $2
      `,
      [progress, jobId]
    );
  },

  async getJobByFileId(fileId) {
    const res = await pool.query(
      `
      SELECT * FROM processing_jobs
      WHERE file_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [fileId] // fileId is a UUID string
    );
    return res.rows[0];
  },

  async getJobById(jobId) {
    const res = await pool.query(
      `
      SELECT * FROM processing_jobs
      WHERE job_id = $1
      `,
      [jobId]
    );
    return res.rows[0];
  }
};

module.exports = ProcessingJob;
