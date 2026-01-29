const crypto = require('crypto');
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { b2S3 } = require('../config/b2S3');
const logger = require('../config/storage.logger');

/* =======================
   HELPERS
======================= */

// Determine safe file extension based on mimetype
function safeExt(mimetype) {
  if (mimetype === 'image/jpeg') return 'jpg';
  if (mimetype === 'image/png') return 'png';
  if (mimetype === 'image/webp') return 'webp';
  return 'bin';
}

/* =======================
   UPLOAD REPORT IMAGE
======================= */

// Upload report image to Backblaze B2 (private bucket)
async function uploadReportImage({ buffer, mimetype, userId, reporteId }) {
  try {
    if (!b2S3) {
      throw new Error('b2S3 client is not initialized');
    }

    const bucket = process.env.B2_BUCKET;
    const ext = safeExt(mimetype);
    const rand = crypto.randomBytes(8).toString('hex');

    const key = `reportes/${userId}/${reporteId}/${Date.now()}_${rand}.${ext}`;

    // Log upload start
    logger.info(
      `Backblaze upload started | reportId=${reporteId} user=${userId} key=${key}`
    );

    await b2S3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    // Log successful upload
    logger.info(
      `Backblaze upload success | reportId=${reporteId} user=${userId} key=${key}`
    );

    return { key };
  } catch (error) {
    // Log upload error
    logger.error(
      `Backblaze upload failed | reportId=${reporteId} user=${userId}`,
      error
    );
    throw error;
  }
}

/* =======================
   SIGNED URL
======================= */

// Generate signed URL to access private image
async function getSignedReportImageUrl(imageKey, expiresInSec = 300) {
  try {
    if (!imageKey) return null;

    // Log signed URL generation
    logger.info(
      `Backblaze signed URL requested | key=${imageKey} expiresIn=${expiresInSec}`
    );

    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET,
      Key: imageKey,
    });

    const signedUrl = await getSignedUrl(b2S3, command, {
      expiresIn: expiresInSec,
    });

    return signedUrl;
  } catch (error) {
    // Log signed URL generation error
    logger.error(
      `Backblaze signed URL generation failed | key=${imageKey}`,
      error
    );
    throw error;
  }
}

/* =======================
   DELETE IMAGE
======================= */

// Delete image from Backblaze bucket
async function deleteReportImage(imageKey) {
  try {
    if (!imageKey) return;

    // Log image deletion attempt
    logger.info(
      `Backblaze delete image started | key=${imageKey}`
    );

    await b2S3.send(
      new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET,
        Key: imageKey,
      })
    );

    // Log successful image deletion
    logger.info(
      `Backblaze delete image success | key=${imageKey}`
    );
  } catch (error) {
    // Log image deletion error
    logger.error(
      `Backblaze delete image failed | key=${imageKey}`,
      error
    );
    throw error;
  }
}

module.exports = {
  uploadReportImage,
  getSignedReportImageUrl,
  deleteReportImage,
};
