const QueryBuilder = require("../../builder/QueryBuilder");
const Event = require("../Event/event.schema");
const Booking = require("./booking.schema");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const { backend_url } = require("../../config");
const generateTicketPDF = require("../../utils/generateTicketPDF");
const formatFileUrl = require("../../utils/formatFileUrl");
exports.createBooking = async (bookingData) => {
  const { userId, eventId, tickets, paymentMethod } = bookingData;
  const event = await Event.findById(eventId).populate("organizerId");
  if (!event) return res.status(404).json({ error: "Event not found" });

  const organizerId = event.organizerId._id;

  // Calculate total payment
  let totalAmount = 0;
  const enrichedTickets = tickets.map((tier) => {
    const totalPrice = tier.price * tier.quantity;
    totalAmount += totalPrice;
    return {
      ...tier,
      totalPrice,
    };
  });

  // Platform fee logic (e.g., 10%)
  const platformFee = totalAmount * 0.1;
  const organizerRevenue = totalAmount - platformFee;
  const ticketDetails = await Promise.all(
    enrichedTickets.flatMap((tier) =>
      Array.from({ length: tier.quantity }).map(async () => {
        const ticketId = uuidv4();
        const qrData = `${backend_url}/api/v1/bookings/tickets/${ticketId}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData); // base64 image

        return {
          ticketId,
          tierName: tier.tierName,
          qrCode: qrData,
          qrCodeUrl,
          status: "active",
        };
      })
    )
  );

  const booking = new Booking({
    userId,
    eventId,
    organizerId,
    orderNumber: `BOOKING-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    tickets: enrichedTickets,
    paymentDetails: {
      method: paymentMethod,
      status: "pending",
      totalAmount,
      platformFee,
      organizerRevenue,
    },
    ticketDetails,
  });

  const result = await booking.save();

  return result;
};

exports.getAllBookings = async (query) => {
  if (query.eventId === "") {
    delete query.eventId;
  }
  if (query.organizerId === "") {
    delete query.organizerId;
  }
  const bookingsQuery = new QueryBuilder(
    Booking.find()
      .populate("userId", "name email phone")
      .populate("eventId", "eventName")
      .populate("organizerId", "name email phone"),
    query
  )
    .search(["orderNumber"])
    .filter(["eventId", "organizerId"])
    .sort()
    .paginate()
    .fields();

  const bookings = await bookingsQuery.modelQuery;

  const meta = await bookingsQuery.countTotal();

  const formattedBookings = bookings.map((booking) => {
    const {
      _id,
      orderNumber,
      paymentDetails,
      refundDetails,
      userId,
      eventId,
      organizerId,
      ticketDetails,
      createdAt,
    } = booking;

    return {
      _id,
      orderNumber,
      paymentDetails,
      refundDetails,
      totalTickets: ticketDetails?.length || 0,
      user: {
        name: userId?.name,
        email: userId?.email,
        phone: userId?.phone,
      },
      event: {
        name: eventId?.eventName,
      },
      organizer: {
        organizerName: organizerId.name,
        organizerEmail: organizerId.email,
        organizerPhone: organizerId.phone,
      },
      createdAt,
    };
  });

  return {
    bookings: formattedBookings,
    meta,
  };
};

exports.downLoadticket = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("eventId");
  if (!booking) return { ticketGenerated: false, error: "Booking not found" };

  // Define and ensure directory
  const dirPath = path.join(__dirname, "../../local/store/pdf");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Create file path
  const filePath = path.join(dirPath, `ticket-${booking._id}.pdf`);

  // Generate the PDF
  await generateTicketPDF(booking, filePath);

  return { ticketGenerated: true, filePath };
};

exports.getBookingsByUserId = async (userId, query) => {
  const bookingsQuery = new QueryBuilder(
    Booking.find({ userId }).populate("eventId organizerId"),
    query
  )
    .search(["orderNumber"])
    .filter(["eventId", "organizerId"])
    .sort()
    .paginate()
    .fields();

  const bookings = await bookingsQuery.modelQuery;
  const meta = await bookingsQuery.countTotal();

  // Format image URLs
  const formattedBookings = bookings.map((booking) => {
    if (Array.isArray(booking.eventId.eventImages)) {
      booking.eventId.eventImages = booking.eventId.eventImages.map((img) =>
        formatFileUrl(img)
      );
    }
    return booking;
  });

  return {
    bookings: formattedBookings,
    meta,
  };
};

exports.getSingleBooking = async (bookingId) => {
  return await Booking.findById(bookingId).populate("eventId userId");
};

exports.getBookingsByOrganizer = async (organizerId, query) => {
  // Prevent invalid ObjectId cast
  if (query.eventId === "") {
    delete query.eventId;
  }
  const bookingsQuery = new QueryBuilder(
    Booking.find({ organizerId })
      .populate("userId", "name email phone")
      .populate("eventId", "eventName"),
    query
  )
    .search(["orderNumber"])
    .filter(["eventId"])
    .sort()
    .paginate()
    .fields();

  const bookings = await bookingsQuery.modelQuery;

  const meta = await bookingsQuery.countTotal();

  const formattedBookings = bookings.map((booking) => {
    const {
      _id,
      orderNumber,
      paymentDetails,
      refundDetails,
      userId,
      eventId,
      ticketDetails,
      createdAt,
    } = booking;

    return {
      _id,
      orderNumber,
      paymentDetails,
      refundDetails,
      totalTickets: ticketDetails?.length || 0,
      user: {
        name: userId?.name,
        email: userId?.email,
        phone: userId?.phone,
      },
      event: {
        name: eventId?.eventName,
      },
      createdAt,
    };
  });

  return {
    bookings: formattedBookings,
    meta,
  };
};

exports.deleteBooking = async (bookingId) => {
  return await Booking.findByIdAndDelete(bookingId);
};

exports.updateBooking = async (bookingId, updatePayload) => {
  return await Booking.findByIdAndUpdate(bookingId, updatePayload, {
    new: true,
  }).populate("eventId organizerId");
};

exports.requestRefund = async (bookingId, reason) => {
  const booking = await Booking.findById(bookingId);

  if (booking.refundDetails.status !== "none")
    return { message: "Refund already requested or processed." };

  booking.refundDetails = {
    status: "requested",
    requestedAt: new Date(),
    reason,
  };

  return await booking.save();
};

exports.processRefund = async (bookingId, action, amount, adminNotes) => {
  const booking = await Booking.findById(bookingId);

  if (action === "approved") {
    // here you could integrate with Stripe to refund
    booking.paymentDetails.status =
      amount < booking.paymentDetails.totalAmount
        ? "partially_refunded"
        : "refunded";

    booking.refundDetails = {
      ...booking.refundDetails,
      status: "completed",
      processedAt: new Date(),
      amount,
      adminNotes,
    };
  } else if (action === "rejected") {
    booking.refundDetails.status = "rejected";
    booking.refundDetails.adminNotes = adminNotes;
  }

  return await booking.save();
};

exports.scanTicket = async (ticketId) => {
  const booking = await Booking.findOne({ "ticketDetails.ticketId": ticketId });

  if (!booking) return null;

  const ticket = booking.ticketDetails.find((t) => t.ticketId === ticketId);

  if (!ticket) throw new Error("Ticket not found");

  if (ticket.status === "used") {
    throw new Error("Ticket already used");
  }

  if (ticket.status === "cancelled") {
    throw new Error("Ticket cancelled");
  }

  ticket.status = "used";
  ticket.usedAt = new Date();

  await booking.save();

  return ticket;
};

exports.getTicketByQRCode = async (ticketId) => {
  const booking = await Booking.findOne({
    "ticketDetails.ticketId": ticketId,
  })
    .populate("eventId", "eventName eventDate startTime endTime venue")
    .populate("userId", "name email");

  if (!booking) return null;

  const ticket = booking.ticketDetails.find((t) => t.ticketId === ticketId);
  // console.log(booking,ticket);

  return {
    message: "Ticket found",
    data: {
      event: {
        name: booking.eventId.eventName,
        date: booking.eventId.eventDate,
        startTime: booking.eventId.startTime,
        endTime: booking.eventId.endTime,
        venue: booking.eventId.venue?.name || null,
        address: booking.eventId.venue?.address || null,
      },
      user: {
        name: booking.userId.name,
        email: booking.userId.email,
      },
      ticket: {
        ticketId: ticket.ticketId,
        tierName: ticket.tierName || "N/A",
        qrCode: ticket.qrCode,
        status: ticket.status,
      },
    },
  };
};

exports.getOrganizerDashboard = async (organizerId) => {
  const bookings = await Booking.find({ organizerId });

  let totalSales = 0;
  let totalPlatformFee = 0;
  let totalTicketsSold = 0;
  let totalRefunds = 0;
  const ticketTypeSales = {};

  bookings.forEach((booking) => {
    const payment = booking.paymentDetails || {};
    const refund = booking.refundDetails || {};
    
    totalSales += payment.totalAmount || 0;
    totalPlatformFee += payment.platformFee || 0;

    // Count tickets and categorize by type
    booking.tickets?.forEach((ticket) => {
      totalTicketsSold += ticket.quantity;

      if (!ticketTypeSales[ticket.tierName]) {
        ticketTypeSales[ticket.tierName] = 0;
      }
      ticketTypeSales[ticket.tierName] += ticket.quantity;
    });

    if (refund.status && refund.status !== "none") {
      totalRefunds += 1;
    }
  });

  const totalBookings = bookings.length;
  const grossRevenue = totalSales;
  const netEarnings = totalSales - totalPlatformFee;
  const refundRate = totalBookings ? (totalRefunds / totalBookings) * 100 : 0;

  return {
    totalBookings,
    totalTicketsSold,
    grossRevenue,
    netEarnings,
    refundRate: Number(refundRate.toFixed(2)), // e.g. 12.34%
    ticketTypeSales, // e.g. { VIP: 10, Regular: 50 }
  };
};


exports.getEventBookingStats = async (eventId, organizerId) => {
  const bookings = await Booking.find({ eventId, organizerId });

  const totalTickets = bookings.reduce(
    (acc, b) => acc + b.tickets.reduce((s, t) => s + t.quantity, 0),
    0
  );
  const usedTickets = bookings.reduce(
    (acc, b) => acc + b.ticketDetails.filter((t) => t.status === "used").length,
    0
  );
  const revenue = bookings.reduce(
    (acc, b) => acc + (b.paymentDetails?.totalAmount || 0),
    0
  );

  return {
    totalBookings: bookings.length,
    totalTickets,
    usedTickets,
    revenue,
  };
};

exports.getAttendees = async (organizerId, eventId) => {
  const filter = { organizerId };
  if (eventId) {
    filter.eventId = eventId;
  }

  const bookings = await Booking.find(filter)
    .populate("userId", "name email phone")
    .populate("eventId", "eventName");

  return bookings.map((booking, index) => ({
    serialNumber: index + 1,
    orderNumber: booking.orderNumber,
    paymentDetails: {
      method: booking.paymentDetails?.method,
      status: booking.paymentDetails?.status,
      totalAmount: booking.paymentDetails?.totalAmount,
    },
    totalTickets: booking.ticketDetails?.length || 0,
    user: {
      name: booking.userId?.name || "N/A",
      email: booking.userId?.email || "N/A",
      phone: booking.userId?.phone || "N/A",
    },
    event: {
      name: booking.eventId?.eventName || "N/A",
    },
    createdAt: booking.createdAt,
  }));
};

// services/refundService.js

exports.getRefundRequests = async ({ organizerId, eventId, userId }) => {
  if (!organizerId) {
    throw new Error("Organizer ID is required.");
  }

  const query = {
    organizerId,
    "refundDetails.status": { $ne: "none" }, // Only refund requests
  };

  if (eventId) query.eventId = eventId;
  if (userId) query.userId = userId;

  const refunds = await Booking.find(query)
    .populate("userId", "name email phone")
    .populate("eventId", "eventName")
    .sort({ "refundDetails.createdAt": -1 });

  return refunds.map((booking) => ({
    orderNumber: booking.orderNumber,
    user: {
      name: booking.userId?.name || "N/A",
      email: booking.userId?.email || "N/A",
      phone: booking.userId?.phone || "N/A",
    },
    event: {
      name: booking.eventId?.eventName || "N/A",
    },
    reason: booking.refundDetails?.reason || "N/A",
    requestedAt: booking.refundDetails?.createdAt || booking.createdAt,
  }));
};
