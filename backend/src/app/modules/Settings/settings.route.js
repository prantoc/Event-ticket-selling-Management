// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const settingsController = require("./settings.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");

router.get("/", settingsController.getAllSettings);
router.patch(
  "/",
  auth("superAdmin", "admin"),
  uploadMedia.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "infoFirstImage", maxCount: 1 },
    { name: "infoSecondImage", maxCount: 1 },
    { name: "marqueeImage", maxCount: 1 },
  ]),
  setRelativePath,
  settingsController.updateSettings
);
router.post(
  "/create-slider",
  auth("superAdmin", "admin"),
  uploadMedia.single("image"),
  setRelativePath,
  settingsController.createSlider
);
router.get(
  "/sliders",

  settingsController.getSlider
);
router.patch(
  "/sliders/:id",
  auth("superAdmin", "admin"),
  uploadMedia.single("image"),
  setRelativePath,
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
