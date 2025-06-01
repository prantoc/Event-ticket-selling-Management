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
  auth("superAdmin", "admin", "user", "organizer"),
  uploadMedia.single("icon"),
  setRelativePath,
  categoryController.createCategory
);
router.get("/", categoryController.getCategories);
router.get(
  "/:id",  categoryController.getCategory
);
router.put(
  "/:id",
  uploadMedia.single("icon"),
  setRelativePath,
  auth("admin", "superAdmin"),
  categoryController.updateCategory
);
router.put(
  "/:id/approve",
  auth("admin", "superAdmin"),
  categoryController.approveCategory
);
router.delete(
  "/:id",
  auth("admin", "superAdmin"),
  categoryController.deleteCategory
);

module.exports = router;
