// utils/uploadToMinio.js
const minioClient = require("../config/minioClient");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

async function ensureBucketExists(bucket) {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

async function uploadFileToMinio(file, bucket) {
  await ensureBucketExists(bucket);
  const ext = path.extname(file.originalname);
  const objectName = `${uuidv4()}${ext}`;
  await minioClient.putObject(bucket, objectName, file.buffer, {
    "Content-Type": file.mimetype,
  });
  return objectName;
}

module.exports = { uploadFileToMinio };
