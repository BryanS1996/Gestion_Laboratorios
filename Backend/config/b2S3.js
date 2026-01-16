<<<<<<< HEAD
// Backend/config/b2S3.js
=======
>>>>>>> rescue-avances
const { S3Client } = require("@aws-sdk/client-s3");

const requiredVars = ['B2_ENDPOINT', 'B2_REGION', 'B2_KEY_ID', 'B2_APP_KEY'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`⚠️ Faltan variables de entorno para B2: ${missingVars.join(', ')}`);
<<<<<<< HEAD
  module.exports = null; // ⚠️ Importante: retorna null explícitamente
=======
  module.exports = null;
>>>>>>> rescue-avances
} else {
  const b2S3 = new S3Client({
    region: process.env.B2_REGION,
    endpoint: process.env.B2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
    },
    forcePathStyle: true,
  });

  module.exports = { b2S3 };
}
