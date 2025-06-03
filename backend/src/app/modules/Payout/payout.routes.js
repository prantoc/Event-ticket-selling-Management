const express = require("express");
const router = express.Router();
const controller = require("./payout.controller");
const auth = require("../../middleware/auth");

router.post(
  "/",
  auth("admin", "superAdmin", "organizer"),
  controller.createPayout
);
router.post(
  "/manual",
  auth("admin", "superAdmin", "organizer"),
  controller.handleManualPayout
);
router.get(
  "/",
  // auth("organizer", "admin", "superAdmin"),
  controller.getAllPayouts
);
router.patch(
  "/:id",
  auth("organizer", "admin", "superAdmin"),
  controller.updatePayout
);

module.exports = router;
