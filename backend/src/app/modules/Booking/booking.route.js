const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");
const auth = require("../../middleware/auth");

router.post("/create", auth("user", "admin", "superAdmin"), bookingController.bookEvent);
router.get("/my-bookings", auth("user","superAdmin"), bookingController.getMyOrders);
router.get("/ticket/:id/download", auth("user","superAdmin"), bookingController.downloadTicket);

module.exports = router;
