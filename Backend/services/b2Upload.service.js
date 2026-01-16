const crypto = require("crypto");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { b2S3 } = require("../config/b2S3");

/**
 * Determina extensión segura según mimetype
 */
function safeExt(mimetype) {
  if (mimetype === "image/jpeg") return "jpg";
  if (mimetype === "image/png") return "png";
  if (mimetype === "image/webp") return "webp";
  return "bin";
}

/**
 * SUBIR imagen de reporte a Backblaze B2
 * Bucket PRIVADO → solo retorna imageKey
 */
async function uploadReportImage({ buffer, mimetype, userId, reporteId }) {
  if (!b2S3) throw new Error("b2S3 no está inicializado. Revisa config/b2S3.js");

  const bucket = process.env.B2_BUCKET;
  const ext = safeExt(mimetype);
  const rand = crypto.randomBytes(8).toString("hex");

  const key = `reportes/${userId}/${reporteId}/${Date.now()}_${rand}.${ext}`;

  console.log("📤 Subiendo imagen a B2:", key);

  await b2S3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return { key };
}

/**
 * GENERAR URL FIRMADA (para mostrar imagen)
 */
async function getSignedReportImageUrl(imageKey, expiresInSec = 300) {
  if (!imageKey) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET,
    Key: imageKey,
  });

  const signedUrl = await getSignedUrl(b2S3, command, {
    expiresIn: expiresInSec,
  });

  return signedUrl;
}

/**
 * BORRAR imagen del bucket (cuando se elimina el reporte)
 */
async function deleteReportImage(imageKey) {
  if (!imageKey) return;

  await b2S3.send(
    new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET,
      Key: imageKey,
    })
  );
}

module.exports = {
  uploadReportImage,
  getSignedReportImageUrl,
  deleteReportImage,
};
