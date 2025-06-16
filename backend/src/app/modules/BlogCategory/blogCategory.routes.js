const express = require("express");
const router = express.Router();
const categoryController = require("./blogcategory.controller");
const auth = require("../../middleware/auth");
const uploadMinio = require("../../middleware/uploadMinio");

router.post(
  "/",
  auth("superAdmin", "admin", "user", "organizer"),
  uploadMinio({ type: "single", name: "icon", bucket: "event-category-icons" }),
  categoryController.createCategory
);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.put(
  "/:id",
  uploadMinio({ type: "single", name: "icon", bucket: "event-category-icons" }),
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
