const express = require("express");
const router = express.Router();
const organizerController = require("./organizer.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");
const uploadMinio = require("../../middleware/uploadMinio");

// Organizer routes (self)
router.post(
  "/",
  auth("superAdmin", "admin", "user", "organizer"),

  uploadMinio({ type: "single", name: "logo", bucket: "organizer-images" }),
  organizerController.createProfile
);
router.get("/me", auth("organizer"), organizerController.getProfile);
router.get(
  "/check-status",
  auth("user", "organizer"),
  organizerController.checkOrganizerStatus
);
router.put(
  "/me",
  auth("organizer"),
  uploadMinio({ type: "single", name: "logo", bucket: "organizer-images" }),
  organizerController.updateProfile
);

router.get(
  "/me/earnings",
  auth("organizer"),
  organizerController.getOrgnizersEarnings
);

//Stripe connect to organizer
router.get(
  "/stripe/connect",
  auth("organizer", "user"),
  organizerController.connectStripeAccount
);
router.get(
  "/stripe/disconnect",
  auth("organizer", "user"),
  organizerController.disconnectStripeAccount
);
router.get("/stripe/callback", organizerController.stripeCallback);
router.get(
  "/stripe/status",
  auth("organizer", "user"),
  organizerController.getStripeStatus
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
