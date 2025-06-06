const QueryBuilder = require("../../builder/QueryBuilder");
const Event = require("../Event/event.schema");
const Booking = require("./booking.schema");
const Organizer = require("../Organizer/organizer.schema");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const { backend_url } = require("../../config");
const generateTicketPDF = require("../../utils/generateTicketPDF");
const formatFileUrl = require("../../utils/formatFileUrl");
const { default: status } = require("http-status");
const stripe = require("../Payments/stripeClient");
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
  const platformFeeRate =
    event.platformCommission != null
      ? Number(event.platformCommission) / 100
      : 0.05;

  const platformFee = totalAmount * platformFeeRate;
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
    // Format event images
    if (Array.isArray(booking.eventId?.eventImages)) {
      booking.eventId.eventImages = booking.eventId.eventImages.map((img) =>
        formatFileUrl(img)
      );
    }

    // Hide ticketDetails if payment is not successful
    if (booking.paymentDetails?.status !== "success") {
      booking.ticketDetails = [];
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
    Booking.find({
      organizerId,
      "refundDetails.status": "none",
    })
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

exports.updateRefundBooking = async (refudId) => {
  console.log("Payment refunded: ", refudId);
  const updatePayload = {
    $set: {
      "refundDetails.status": "completed",
      "refundDetails.processedAt": new Date(),
    },
  };
  const booking = await Booking.findOneAndUpdate(
    { "refundDetails.chargeId": refudId },
    updatePayload,
    {
      new: true,
    }
  ).populate("eventId organizerId");
  // console.log("Update Details: ", result);
  if (!booking) {
    console.warn("Booking not found for refund");
    return null;
  }

  const event = await Event.findById(booking.eventId);
  const organizer = await Organizer.findOne({ userId: booking.organizerId });
  const refundedAmount = booking.refundDetails.amount || 0;

  // 2. Adjust ticket tiers in event
  if (event && Array.isArray(booking.tickets)) {
    for (const ticket of booking.tickets) {
      const tier = event.ticketTiers.id(ticket.ticketTierId);
      if (tier) {
        tier.availableQuantity += ticket.quantity;
        tier.sold = Math.max(tier.sold - ticket.quantity, 0);
      }
    }
    await event.save();
    console.log("Event updated");
  }

  // 3. Adjust organizer earnings
  if (organizer && organizer.earnings) {
    const platformFee = booking.paymentDetails?.platformFee || 0;
    const netRefund = refundedAmount - platformFee;

    organizer.earnings.grossTotal = Math.max(
      organizer.earnings.grossTotal - refundedAmount,
      0
    );
    // organizer.earnings.totalPlatformFee = Math.max(
    //   organizer.earnings.totalPlatformFee - platformFee,
    //   0
    // );
    organizer.earnings.total = Math.max(
      organizer.earnings.total - netRefund,
      0
    );
    organizer.earnings.available = Math.max(
      organizer.earnings.available - netRefund,
      0
    );

    await organizer.save();
    console.log("Organizer updated");
  }
  return booking;
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
  if (!booking) throw new Error("Booking not found");

  const paymentIntentId = booking.paymentDetails?.stripePaymentIntentId;
  if (!paymentIntentId) throw new Error("Stripe paymentIntent not found");

  if (
    booking.refundDetails?.status &&
    ["processing", "completed", "rejected"].includes(
      booking.refundDetails.status
    )
  ) {
    throw new Error(
      `Cannot process refund. Current status: ${booking.refundDetails.status}`
    );
  }

  if (action === "approved") {
    // Validate refund amount
    const totalPaid = booking.paymentDetails?.totalAmount || 0;
    if (amount <= 0 || amount > totalPaid) {
      throw new Error("Invalid refund amount");
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      reason: "requested_by_customer",
    });

    booking.paymentDetails.status =
      amount < totalPaid ? "partially_refunded" : "refunded";

    booking.refundDetails = {
      status: "processing",
      stripeRefundId: refund.id,
      chargeId: refund.charge,
      balance_transaction: refund.balance_transaction,
      processedAt: new Date(),
      amount,
      adminNotes,
    };

    await booking.save();
    return { success: true, message: "Refund initiated", refund };
  } else if (action === "rejected") {
    booking.refundDetails.status = "rejected";
    booking.refundDetails.adminNotes = adminNotes;
    booking.refundDetails.processedAt = new Date();

    await booking.save();
    return { success: true, message: "Refund rejected" };
  } else {
    throw new Error("Invalid refund action");
  }
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
  const bookings = await Booking.find({
    organizerId,
    "paymentDetails.status": "success",
  });

  const organizer = await Organizer.findOne({ userId: organizerId });

  let totalSales = 0;
  let totalPlatformFee = 0;
  let totalTicketsSold = 0;
  let totalRefunds = 0;

  const ticketTypeSales = {}; // { [tierName]: quantity }
  const ticketTypeRevenue = {}; // { [tierName]: total revenue }

  bookings.forEach((booking) => {
    const payment = booking.paymentDetails || {};
    const refund = booking.refundDetails || {};

    totalSales += payment.totalAmount || 0;
    totalPlatformFee += payment.platformFee || 0;

    booking.tickets?.forEach((ticket) => {
      const tier = ticket.tierName;
      const quantity = ticket.quantity || 0;
      const price = ticket.price || 0;
      const total = quantity * price;

      totalTicketsSold += quantity;

      if (!ticketTypeSales[tier]) ticketTypeSales[tier] = 0;
      ticketTypeSales[tier] += quantity;

      if (!ticketTypeRevenue[tier]) ticketTypeRevenue[tier] = 0;
      ticketTypeRevenue[tier] += total;
    });

    if (refund.status && refund.status !== "none") {
      totalRefunds += 1;
    }
  });

  const ticketTypeAverages = {};
  for (const tier in ticketTypeSales) {
    const quantity = ticketTypeSales[tier];
    const revenue = ticketTypeRevenue[tier] || 0;
    ticketTypeAverages[tier] = quantity ? +(revenue / quantity).toFixed(2) : 0;
  }

  const totalAverageTicketPrice = totalTicketsSold
    ? +(totalSales / totalTicketsSold).toFixed(2)
    : 0;

  const totalBookings = bookings.length;
  const grossRevenue = organizer.earnings.grossTotal;
  const netEarnings = organizer.earnings.total;
  const refundRate = totalBookings ? (totalRefunds / totalBookings) * 100 : 0;

  return {
    totalBookings,
    totalTicketsSold,
    grossRevenue,
    netEarnings,
    refundRate: Number(refundRate.toFixed(2)),
    totalAverageTicketPrice,
    ticketTypeSales,
    ticketTypeRevenue,
    ticketTypeAverages,
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

exports.getRefundRequests = async ({
  organizerId,
  eventId,
  userId,
  userRole,
}) => {
  const isAdmin = userRole === "admin" || userRole === "superAdmin";

  // Only require organizerId if not an admin
  if (!isAdmin && !organizerId) {
    throw new Error("Organizer ID is required.");
  }

  const query = {
    "refundDetails.status": { $ne: "none" },
  };

  // Apply filters based on role
  if (!isAdmin) {
    query.organizerId = organizerId;
  }

  if (eventId) query.eventId = eventId;
  if (userId) query.userId = userId;

  const refunds = await Booking.find(query)
    .populate("userId", "name email phone")
    .populate("eventId", "eventName refundPolicy eventDate")
    .sort({ "refundDetails.createdAt": -1 });

  return refunds.map((booking) => {
    const event = booking.eventId;
    const totalAmount = booking.paymentDetails?.organizerRevenue || 0;

    let refundPercentage = 0;
    const requestDate = booking.refundDetails?.createdAt || booking.createdAt;

    if (
      event?.refundPolicy?.type === "time-based" &&
      Array.isArray(event?.refundPolicy?.rules)
    ) {
      const daysBefore = moment(event.eventDate).diff(
        moment(requestDate),
        "days"
      );

      const matchedRule = event.refundPolicy.rules
        .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)
        .find((rule) => daysBefore >= rule.daysBeforeEvent);

      refundPercentage = matchedRule?.refundPercentage || 0;
    } else if (event?.refundPolicy?.type === "custom") {
      refundPercentage = 0;
    } else if (event?.refundPolicy?.type === "no-refunds") {
      refundPercentage = 0;
    }

    const refundedAmount = (totalAmount * refundPercentage) / 100;

    return {
      bookingId: booking._id,
      orderNumber: booking.orderNumber,
      status: booking.refundDetails?.status || "none",
      paymentDetails: {
        method: booking.paymentDetails?.method || "N/A",
        status: booking.paymentDetails?.status || "N/A",
        totalAmount,
      },
      user: {
        name: booking.userId?.name || "N/A",
        email: booking.userId?.email || "N/A",
        phone: booking.userId?.phone || "N/A",
      },
      event: {
        name: event?.eventName || "N/A",
      },
      refundPercentage,
      refundedAmount,
      reason: booking.refundDetails?.reason || "N/A",
      requestedAt: requestDate,
    };
  });
};
