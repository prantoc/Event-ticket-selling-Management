// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const settingsController = require("./settings.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");

router.get("/", settingsController.getSettings);
router.patch(
  "/",
  auth("superAdmin", "admin"),
  uploadMedia.single("companyLogo"),
  setRelativePath,
  settingsController.updateSettings
);

router.get("/policy", settingsController.getPolicies);
router.patch("/policy/update", settingsController.upsertPolicy);
router.get("/admin-stats", settingsController.getAdminDashboard);

module.exports = router;
