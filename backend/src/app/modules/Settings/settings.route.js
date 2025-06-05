// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const settingsController = require("./settings.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");
const uploadMinio = require("../../middleware/uploadMinio");

router.get("/", settingsController.getAllSettings);
router.patch(
  "/",
  auth("superAdmin", "admin"),
  uploadMinio({
    type: "fields",
    fields: [
      { name: "companyLogo", maxCount: 1 },
      { name: "infoFirstImage", maxCount: 1 },
      { name: "infoSecondImage", maxCount: 1 },
      { name: "marqueeImage", maxCount: 1 },
    ],
    bucket: "settings-images",
  }),
  settingsController.updateSettings
);

router.post(
  "/create-slider",
  auth("superAdmin", "admin"),
  uploadMinio({ type: "single", name: "image", bucket: "settings-images" }),
  settingsController.createSlider
);
router.get(
  "/sliders",

  settingsController.getSlider
);
router.patch(
  "/sliders/:id",
  auth("superAdmin", "admin"),
  uploadMinio({ type: "single", name: "image", bucket: "settings-images" }),
  settingsController.updateSlider
);
router.delete(
  "/sliders/:id",
  auth("superAdmin", "admin"),
  settingsController.deleteSlider
);

router.get("/policy", settingsController.getPolicies);
router.patch("/policy/update", settingsController.upsertPolicy);
router.get("/admin-stats", settingsController.getAdminDashboard);

module.exports = router;
