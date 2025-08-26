

const { bucket } = require('../src/config/gcs'); // Make sure this is correctly importing your initialized bucket

/**
 * Upload a file buffer to Google Cloud Storage
 */
exports.uploadToGCS = async (filename, buffer, folder = 'uploads') => {
  const timestamp = Date.now();
  const destination = `${folder}/${timestamp}_${filename}`;
  const file = bucket.file(destination);

  await file.save(buffer, {
    resumable: false,
    contentType: 'auto',
    metadata: {
      cacheControl: 'public, max-age=31536000'
    },
  });

  // Return GCS path (not signed URL)
  return { url: file.publicUrl(), path: destination };
};

/**
 * Generate a temporary signed URL for download
 */
exports.getSignedUrl = async (gcsPath, expiresInSeconds = 300) => {
  const file = bucket.file(gcsPath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000, // Default 5 minutes
  });

  return url;
};
