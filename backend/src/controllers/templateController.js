const { Storage } = require('@google-cloud/storage');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs');
const os = require('os');
const mammoth = require('mammoth');
const pool = require('../config/db');
const Template = require('../models/Template');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString())
});

const BUCKET_NAME = process.env.GCS_BUCKET;

function normalizeGcsKey(gcsPath, bucketName) {
  if (!gcsPath) return null;

  let key = gcsPath.trim();

  if (key.startsWith(`gs://${bucketName}/`)) {
    key = key.replace(`gs://${bucketName}/`, '');
  } else if (key.startsWith(`https://storage.googleapis.com/${bucketName}/`)) {
    key = key.replace(`https://storage.googleapis.com/${bucketName}/`, '');
  } else if (key.startsWith(`/${bucketName}/`)) {
    key = key.replace(`/${bucketName}/`, '');
  }

  return key.replace(/^\/+/, '');
}

exports.getTemplates = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM templates WHERE status = $1', ['active']);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

exports.openDocxTemplateAsHtml = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      console.log('Unauthorized: No user ID provided.');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`Attempting to open template ID: ${id} for user: ${userId}`);
    const result = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
    if (!result.rows.length) {
      console.log(`Template with ID: ${id} not found.`);
      return res.status(404).json({ message: 'Template not found' });
    }

    const template = result.rows[0];
    console.log(`Found template: ${template.name}, GCS Path: ${template.gcs_path}`);
    const srcKey = normalizeGcsKey(template.gcs_path, BUCKET_NAME);
    if (!srcKey) {
      console.error('Normalized GCS key is null or empty.');
      return res.status(500).json({ message: 'Error: Invalid GCS path for template.' });
    }
    const srcFile = storage.bucket(BUCKET_NAME).file(srcKey);

    const tmpFilePath = path.join(os.tmpdir(), `${Date.now()}-${path.basename(srcKey)}`);
    console.log(`Downloading file from GCS to temporary path: ${tmpFilePath}`);
    const fileBuffer = await srcFile.download();
    fs.writeFileSync(tmpFilePath, fileBuffer[0]);
    console.log('File downloaded and written to temporary path.');

    const { fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(fileBuffer[0]);
    console.log(`Detected file type: ${fileType ? fileType.ext : 'unknown'}`);

    if (!fileType || fileType.ext !== 'docx') {
      fs.unlinkSync(tmpFilePath);
      console.log(`Invalid file type detected: ${fileType ? fileType.ext : 'unknown'}. Only DOCX files are supported.`);
      return res.status(400).json({ message: 'Invalid file type. Only DOCX files are supported.' });
    }

    console.log('Converting DOCX to HTML using mammoth...');
    const { value: html } = await mammoth.convertToHtml({ path: tmpFilePath });
    fs.unlinkSync(tmpFilePath);
    console.log('DOCX converted to HTML successfully. Temporary file deleted.');

    res.json({ html });
  } catch (err) {
    console.error('Error converting DOCX to HTML:', err);
    if (err instanceof Error) {
      if (err.message.includes('Can\'t find end of central directory')) {
        console.error('Specific error: Corrupted or invalid DOCX file.');
        return res.status(400).json({ message: 'The provided DOCX file is corrupted or invalid.' });
      }
      console.error('Generic error during DOCX to HTML conversion. Error details:', err.message);
    } else {
      console.error('Generic error during DOCX to HTML conversion. Unknown error type:', err);
    }
    res.status(500).json({ message: 'Error converting DOCX to HTML' });
  }
};

exports.saveUserDraft = async (req, res) => {
  try {
    const { templateId, name } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const gcsPath = `nexintel-uploads/${userId}/drafts/${Date.now()}-${req.file.originalname}`;
    const file = storage.bucket(BUCKET_NAME).file(gcsPath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    const { rows } = await pool.query(
      `INSERT INTO user_drafts (user_id, template_id, name, gcs_path)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, templateId, name, gcsPath]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error saving user draft:', err);
    res.status(500).json({ message: 'Error saving user draft' });
  }
};

exports.exportUserDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows } = await pool.query(
      'SELECT * FROM user_drafts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    const file = storage.bucket(BUCKET_NAME).file(rows[0].gcs_path);
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ message: 'Draft file not found' });
    }

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });

    res.json({ exportUrl: url });
  } catch (err) {
    console.error('Error exporting user draft:', err);
    res.status(500).json({ message: 'Error exporting user draft' });
  }
};
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Ensure the template is either public or owned by the user
    if (!template.is_public && template.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(template);
  } catch (err) {
    console.error('Error fetching template by ID:', err);
    res.status(500).json({ message: 'Error fetching template' });
  }
};

exports.getUserTemplates = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const templates = await Template.findByUserId(userId);
    res.json(templates);
  } catch (err) {
    console.error('Error fetching user templates:', err);
    res.status(500).json({ message: 'Error fetching user templates' });
  }
};

exports.addHtmlTemplate = async (req, res) => {
  try {
    const { name, html, is_public } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newTemplate = await Template.create({
      user_id: userId,
      name,
      html,
      is_public: is_public || false
    });

    res.status(201).json(newTemplate);
  } catch (err) {
    console.error('Error adding HTML template:', err);
    res.status(500).json({ message: 'Error adding HTML template' });
  }
};
