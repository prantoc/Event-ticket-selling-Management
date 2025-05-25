const BookingService = require("./booking.service");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

exports.bookEvent = async (req, res) => {
  try {
    const { eventId, tickets, paymentMethod = "stripe" } = req.body;
    const userId = req.user.userId;

    const booking = await BookingService.createBooking({
      userId,
      eventId,
      tickets,
      paymentMethod,
    });
    // Fetch event and organizer

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create booking",
      message: error.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const query = { ...req.query };
    const userId = req.user.userId;
    const booking = await BookingService.getBookingsByUserId(userId, query);
    if (!booking) {
      return res.status(200).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your orders retrieved",
      bookings: booking.bookings,
      meta: booking.meta,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch orders", message: error.message });
  }
};

exports.downloadTicket = async (req, res) => {
  try {
    const { ticketGenerated, filePath } = await BookingService.downLoadticket(
      req.params.id
    );

    if (!ticketGenerated) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    setTimeout(() => {
      res.download(filePath, "ticket.pdf", (err) => {
        if (!err) fs.unlinkSync(filePath); // delete after sending
      });
    }, 1000);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to download ticket", message: error.message });
  }
};

exports.requestRefund = async (req, res) => {
  const { reason } = req.body;
  const result = await BookingService.requestRefund(req.params.id, reason);

  res
    .status(200)
    .json({ success: true, message: "Refund requested", data: result });
};

exports.processRefund = async (req, res) => {
  const { action, amount, adminNotes } = req.body; // action: "approved", "rejected"
  const result = await BookingService.processRefund(
    req.params.id,
    action,
    amount,
    adminNotes
  );

  res
    .status(200)
    .json({ sucess: true, message: "Refund updated", data: result });
};

exports.getAllBookings = async (req, res) => {
  try {
    const query = { ...req.query };
    const booking = await BookingService.getAllBookings(query);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved",
      bookings: booking.bookings,
      meta: booking.meta,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch bookings", message: error.message });
  }
};
exports.getSingleBooking = async (req, res) => {
  try {
    const booking = await BookingService.getSingleBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking retrieved",
      booking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch booking", message: error.message });
  }
};

exports.getBookingsByOrganizer = async (req, res) => {
  try {
    const query = { ...req.query };
    const organizerId = req.user.userId;
    const booking = await BookingService.getBookingsByOrganizer(
      organizerId,
      query
    );
    if (!booking) {
      return res.status(200).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved",
      bookings: booking.bookings,
      meta: booking.meta,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch bookings", message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await BookingService.updateBooking(req.params.id, req.body);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update booking", message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await BookingService.deleteBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted",
      booking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to delete booking", message: error.message });
  }
};

exports.scanTicket = async (req, res) => {
  try {
    const result = await BookingService.scanTicket(req.body.ticketId);

    if (!result) return res.status(404).json({ message: "Ticket not found" });

    return res.status(200).json({
      success: true,
      message: "Ticket is valid and marked as used",
      ticket: result,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTicketByQRCode = async (req, res) => {
  try {
    const result = await BookingService.getTicketByQRCode(req.params.ticketId);
    if (!result) return res.status(404).json({ message: "Ticket not found" });

    return res
      .status(200)
      .json({ success: true, message: "Ticket found", data: result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

exports.getOrganizerDashboard = async (req, res) => {
  try {
    const result = await BookingService.getOrganizerDashboard(req.user.userId);
    return res
      .status(200)
      .json({ success: true, message: "Dashboard data", data: result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: err.message,
    });
  }
};

exports.getEventBookingStats = async (req, res) => {
  try {
    const result = await BookingService.getEventBookingStats(
      req.params.eventId,
      req.user.userId
    );
    return res
      .status(200)
      .json({ success: true, message: "Booking stats", data: result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: err.message,
    });
  }
};

exports.exportAttendees = async (req, res) => {
  try {
    const { eventId } = req.query;
    const organizerId = req.user.userId;

    const attendees = await BookingService.getAttendees(organizerId, eventId);

    const fields = [
      "serialNumber",
      "orderNumber",
      "paymentDetails.method",
      "paymentDetails.status",
      "paymentDetails.totalAmount",
      "totalTickets",
      "user.name",
      "user.email",
      "user.phone",
      "event.name",
      "createdAt",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(attendees);

    res.header("Content-Type", "text/csv");
    res.attachment(`attendees-${eventId || "all"}.csv`);
    return res.send(csv);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Export failed", error: err.message });
  }
};

exports.getRefundRequests = async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    const organizerId = req.user.userId;
    const userRole = req.user.role;

    const refundList = await BookingService.getRefundRequests({
      organizerId,
      eventId,
      userId,
      userRole,
    });

    res.json({ success: true, data: refundList });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch refund requests",
      error: err.message,
    });
  }
};
