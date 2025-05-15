const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");
const auth = require("../../middleware/auth");

router.post(
  "/",
  auth("superadmin", "admin", "user"),
  uploadMedia.single("icon"),
  setRelativePath,
  categoryController.createCategory
);
router.get(
  "/",
  auth("admin", "superadmin", "user"),
  categoryController.getCategories
);
router.get(
  "/:id",
  auth("admin", "superadmin", "user"),
  categoryController.getCategory
);
router.put(
  "/:id",
  uploadMedia.single("icon"),
  setRelativePath,
  auth("admin", "superadmin"),
  categoryController.updateCategory
);
router.put(
  "/:id/approve",
  auth("admin", "superadmin"),
  categoryController.approveCategory
);
router.delete(
  "/:id",
  auth("admin", "superadmin"),
  categoryController.deleteCategory
);

module.exports = router;
