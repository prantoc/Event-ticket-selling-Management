const express = require("express");
const router = express.Router();
const organizerController = require("./organizer.controller");
const auth = require("../../middleware/auth");

// Organizer routes (self)
router.post("/",auth('user'), organizerController.createProfile);
router.get("/me", organizerController.getProfile);
router.put("/me", organizerController.updateProfile);

// Admin routes
router.get("/", organizerController.getAllOrganizers);
router.put("/:userId/approve", organizerController.approve);
router.put("/:userId/reject", organizerController.reject);

module.exports = router;
