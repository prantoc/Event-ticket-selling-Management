const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");

router.post(
  "/",
  uploadMedia.single("icon"),
  setRelativePath,
  categoryController.createCategory
);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.put(
  "/:id",
  uploadMedia.single("icon"),
  setRelativePath,
  categoryController.updateCategory
);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
