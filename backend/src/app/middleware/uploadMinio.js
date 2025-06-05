// middlewares/uploadMinio.js
const multer = require("multer");
const { uploadFileToMinio } = require("../utils/uploadToMinio");

const storage = multer.memoryStorage();
const uploader = multer({ storage });

function uploadMinio({ type = "array", name = "", fields = [], bucket }) {
  let multerMiddleware;

  if (type === "single") {
    multerMiddleware = uploader.single(name);
  } else if (type === "array") {
    multerMiddleware = uploader.array(name);
  } else if (type === "fields") {
    multerMiddleware = uploader.fields(fields);
  } else {
    throw new Error("Invalid uploadMinio type. Use 'single', 'array', or 'fields'.");
  }

  return [
    multerMiddleware,
    async (req, res, next) => {
      try {
        const uploaded = {};

        if (type === "single" && req.file) {
          uploaded[name] = await uploadFileToMinio(req.file, bucket);
        } else if (type === "array" && req.files) {
          uploaded[name] = await Promise.all(
            req.files.map((file) => uploadFileToMinio(file, bucket))
          );
        } else if (type === "fields" && req.files) {
          for (const field of fields) {
            if (req.files[field.name]) {
              uploaded[field.name] = await Promise.all(
                req.files[field.name].map((file) =>
                  uploadFileToMinio(file, bucket)
                )
              );
            }
          }
        }

        req.minioFiles = uploaded;
        next();
      } catch (err) {
        console.error("MinIO upload error:", err);
        return res.status(500).json({
          message: "Failed to upload file(s) to MinIO",
          error: err.message,
        });
      }
    },
  ];
}

module.exports = uploadMinio;
