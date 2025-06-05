const minioClient = require("../config/minioClient");

const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function getPresignedUrl(input, bucket, expiry = 7 * 24 * 60 * 60) {
  if (!input) return null;

  let objectName = input;

  // If input looks like a URL, extract object name
  try {
    const parsed = new URL(input);
    objectName = path.basename(parsed.pathname);
  } catch (_) {
    // input is already a plain objectName
  }

  try {
    return await minioClient.presignedGetObject(bucket, objectName, expiry);
  } catch (err) {
    console.error(
      `Error generating presigned URL for ${objectName}:`,
      err.message
    );
    return null;
  }
}

module.exports = { getPresignedUrl };
