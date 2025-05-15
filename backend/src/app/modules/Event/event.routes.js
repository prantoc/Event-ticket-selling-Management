const express = require("express");
const router = express.Router();
const eventController = require("./event.controller");
const auth = require("../../middleware/auth");
const { uploadMedia } = require("../../middleware/multerConfig");

// Organizer routes
router.post(
  "/",
  auth("admin","user"),
  // uploadMedia.array("images"),
  eventController.createEvent
);
router.put(
  "/:id",
  auth("admin","user"),
  uploadMedia.array("images"),
  eventController.updateEvent
);
router.delete("/:id", auth("admin","user"), eventController.deleteEvent);

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;
