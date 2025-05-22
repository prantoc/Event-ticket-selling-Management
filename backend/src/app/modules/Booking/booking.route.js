const express = require("express");
const router = express.Router();
const bookingController = require("./booking.controller");
const auth = require("../../middleware/auth");

// ==============================
// ✅ PUBLIC ROUTES
// ==============================

// QR Code Ticket Info
router.get('/tickets/:ticketId', bookingController.getTicketByQRCode);

// ==============================
// ✅ AUTHENTICATED USER ROUTES
// ==============================

// Create a booking
router.post(
  "/create",
  auth("user", "admin", "superAdmin"),
  bookingController.bookEvent
);

// Get current user's bookings
router.get(
  "/my-bookings",
  auth("user", "superAdmin"),
  bookingController.getMyOrders
);

// Download ticket
router.get(
  "/ticket/:id/download",
  auth("user", "superAdmin"),
  bookingController.downloadTicket
);

// Request a refund
router.post(
  "/:id/request-refund",
  auth("user", "superAdmin"),
  bookingController.requestRefund
);

// ==============================
// ✅ ORGANIZER ROUTES
// ==============================

// Organizer: Get all their bookings
router.get(
  "/organizer",
  auth("organizer"),
  bookingController.getBookingsByOrganizer
);

// Organizer: Dashboard summary
router.get(
  "/organizer/dashboard",
  auth("organizer","superAdmin"),
  bookingController.getOrganizerDashboard
);

// Organizer: Event booking stats
router.get(
  "/organizer/stats/:eventId",
  auth("organizer","superAdmin"),
  bookingController.getEventBookingStats
);

// Organizer: Export attendee list
router.get(
  "/organizer/export",
  auth("organizer","superAdmin"),
  bookingController.exportAttendees
);

router.get(
  "/refunds",
  auth("admin", "superAdmin", "organizer"),
  bookingController.getRefundRequests
);

// Organizer: Process refund
router.post(
  "/:id/process-refund",
  auth("organizer", "admin", "superAdmin"),
  bookingController.processRefund
);

// Organizer/Admin: Update booking status
router.put(
  "/:id",
  auth("organizer", "admin", "superAdmin"),
  bookingController.updateBookingStatus
);

// Organizer/Admin: Scan ticket
router.post(
  "/tickets/scan",
  auth("organizer", "admin", "superAdmin"),
  bookingController.scanTicket
);

// Organizer/Admin: Get a single booking
router.get(
  "/:id",
  auth("organizer", "admin", "superAdmin"),
  bookingController.getSingleBooking
);

// ==============================
// ✅ ADMIN & SUPER ADMIN ROUTES
// ==============================

// Admin: Get all bookings
router.get(
  "/",
  auth("admin", "superAdmin","organizer"),
  bookingController.getAllBookings
);

// Admin: Delete booking
router.delete(
  "/:id",
  auth("admin", "superAdmin"),
  bookingController.deleteBooking
);

module.exports = router;
