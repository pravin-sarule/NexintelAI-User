const { bucket } = require('../config/gcs');
const File = require('../models/File');
const User = require('../models/User'); // Assuming you might need user details for storage limits
require('dotenv').config();

const MAX_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB in bytes

const uploadFileToGCS = (file, userId, folderPath = '') => {
  return new Promise(async (resolve, reject) => {
    const gcsFileName = `${userId}/${folderPath ? folderPath + '/' : ''}${Date.now()}-${file.originalname}`;
    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error('GCS Upload Error:', err);
      reject(err);
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      try {
        const newFile = await File.create({
          user_id: userId,
          originalname: file.originalname,
          gcs_path: blob.name,
          folder_path: folderPath,
          mimetype: file.mimetype,
          size: file.size,
        });
        resolve(newFile);
      } catch (dbError) {
        console.error('Database Error after GCS upload:', dbError);
        // Optionally delete the file from GCS if DB insertion fails
        await blob.delete().catch(console.error);
        reject(dbError);
      }
    });

    blobStream.end(file.buffer);
  });
};

const checkStorageLimit = async (userId, newFileSize = 0) => {
  const totalUsed = await File.getTotalStorageUsed(userId);
  return (totalUsed + newFileSize) <= MAX_STORAGE_BYTES;
};

const getSignedUrlForFile = async (gcsPath) => {
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await bucket.file(gcsPath).getSignedUrl(options);
  return url;
};

module.exports = { uploadFileToGCS, checkStorageLimit, getSignedUrlForFile, MAX_STORAGE_BYTES };