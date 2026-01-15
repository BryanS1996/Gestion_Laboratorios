// Backend/config/b2S3.js
const { S3Client } = require("@aws-sdk/client-s3");

const {
  B2_ENDPOINT,
  B2_REGION,
  B2_KEY_ID,
  B2_APP_KEY,
} = process.env;

if (!B2_ENDPOINT) console.warn("⚠️ Falta B2_ENDPOINT en .env");
if (!B2_KEY_ID) console.warn("⚠️ Falta B2_KEY_ID en .env");
if (!B2_APP_KEY) console.warn("⚠️ Falta B2_APP_KEY en .env");

const b2S3 = new S3Client({
  region: B2_REGION || "us-east-005",
  endpoint: B2_ENDPOINT,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APP_KEY,
  },
  forcePathStyle: true,
});

module.exports = { b2S3 };
