const QueryBuilder = require("../../builder/QueryBuilder");
const Event = require("../Event/event.schema");
const Booking = require("./booking.schema");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const path = require("path");
const { backend_url } = require("../../config");
const generateTicketPDF = require("../../utils/generateTicketPDF");
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

  // Generate ticketDetails with unique ticketId
  //   const ticketDetails = enrichedTickets.flatMap((tier) =>
  //     Array.from({ length: tier.quantity }).map(() => ({
  //       ticketId: uuidv4(),
  //       qrCode: null, // Placeholder — generate QR here if needed
  //       qrCodeUrl: null,
  //       status: "active",
  //     }))
  //   );

  const ticketDetails = await Promise.all(
    enrichedTickets.flatMap((tier) =>
      Array.from({ length: tier.quantity }).map(async () => {
        const ticketId = uuidv4();
        const qrData = `${backend_url}/tickets/${ticketId}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData); // base64 image

        return {
          ticketId,
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
    if (Array.isArray(booking.eventId.images)) {
      booking.eventId.images = booking.eventId.images.map((img) =>
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

exports.downLoadticket = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("eventId");

  if (!booking) return { ticketGenerated: true };
  const filePath = path.join(
    __dirname,
    `../../local/store/pdf/ticket-${booking._id}.pdf`
  );
  generateTicketPDF(booking, filePath);
  return { ticketGenerated: true, filePath };
};
