const express = require("express");
const router = express.Router();
const organizerController = require("./organizer.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");

// Organizer routes (self)
router.post(
  "/",
  auth("superAdmin", "admin", "user", "organizer"),
  uploadMedia.single("logo"),
  setRelativePath,
  organizerController.createProfile
);
router.get("/me", auth("organizer"), organizerController.getProfile);
router.put(
  "/me",
  auth("organizer"),
  uploadMedia.single("logo"),
  setRelativePath,
  organizerController.updateProfile
);

router.get(
  "/me/earnings",
  auth("organizer"),
  organizerController.getOrgnizersEarnings
);

// Admin routes
router.get(
  "/",
  auth("superAdmin", "admin"),
  organizerController.getAllOrganizers
);
router.put(
  "/:userId/approve",
  auth("superAdmin", "admin"),
  organizerController.approve
);
router.put(
  "/:userId/reject",
  auth("superAdmin", "admin"),
  organizerController.reject
);
router.delete(
  "/:userId/delete",
  auth("superAdmin", "admin"),
  organizerController.deleteOrganizer
);
module.exports = router;
