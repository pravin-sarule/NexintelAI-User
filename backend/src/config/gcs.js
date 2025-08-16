// const { Storage } = require('@google-cloud/storage');
// const admin = require('firebase-admin');
// require('dotenv').config();

// // Initialize Firebase Admin SDK
// const serviceAccount = require('../../gcs-key.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// // Initialize Google Cloud Storage
// const storage = new Storage({
//   projectId: serviceAccount.project_id,
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
// });

// const bucket = storage.bucket(process.env.GCS_BUCKET);

// module.exports = { bucket, admin };

// const { Storage } = require('@google-cloud/storage');

// const keyBuffer = Buffer.from(process.env.GCS_KEY_BASE64, 'base64');
// const gcsKey = JSON.parse(keyBuffer.toString());

// const storage = new Storage({
//   projectId: gcsKey.project_id,
//   credentials: gcsKey,
// });

// module.exports = storage;
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

let credentials;

if (process.env.GCS_KEY_BASE64) {
  const jsonString = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf-8');
  credentials = JSON.parse(jsonString);
} else {
  // fallback for local dev
  credentials = require('../../gcs-key.json');
}

const storage = new Storage({
  credentials,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

module.exports = { storage, bucket, credentials };
