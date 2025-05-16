const express = require("express");
const router = express.Router();
const eventController = require("./event.controller");
const auth = require("../../middleware/auth");
const {
  uploadMedia,
  setRelativePath,
} = require("../../middleware/multerConfig");

// Organizer routes
router.post(
  "/",
  auth("superAdmin", "admin", "organizer"),
  uploadMedia.array("eventImages"),
  setRelativePath,
  eventController.createEvent
);
router.put(
  "/:id",
  auth("superAdmin", "admin", "organizer"),
  uploadMedia.array("eventImages"),
  setRelativePath,
  eventController.updateEvent
);
router.delete(
  "/:id",
  auth("superAdmin", "admin", "organizer"),
  eventController.deleteEvent
);

//Get event by organizer
router.get(
  "/organizer",
  auth("organizer",),
  eventController.getEventByOrganizer
);

// Admin routes
//approve event by admin
router.get("/all", auth("admin", "superAdmin"), eventController.getAllEventsByAdmin);
router.put(
  "/:id/status",
  auth("admin", "superAdmin"),
  eventController.updateStatus
);


// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;
