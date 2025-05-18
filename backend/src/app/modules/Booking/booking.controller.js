const BookingService = require("./booking.service");
const fs = require("fs");
const path = require("path");
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
      return res.status(404).json({
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
    const {ticketGenerated,filePath} = await BookingService.downLoadticket(req.params.id);
    // console.log("booking",booking);
    
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

    // return res.status(200).json({
    // success: true,
    // message: "Ticket downloaded successfully",
    // data: booking,
    // });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to download ticket", message: error.message });
  }
};
