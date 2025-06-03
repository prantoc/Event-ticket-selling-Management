const paymentService = require("./payment.service");
const bookingService = require("../Booking/booking.service");
const organizerService = require("../Organizer/organizer.service");
const eventService = require("../Event/event.service");
const userService = require("../User/user.service");
const stripe = require("./stripeClient");
const dotenv = require("dotenv");
const path = require("path");
const sendBookingSuccessEmail = require("../../utils/sendBookingSuccessEmail");
dotenv.config({ path: path.join(process.cwd(), ".env") });

exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, userId, bookingId, eventId, eventName } =
      req.body;

    const sessionUrl = await paymentService.createStripeCheckoutSession({
      amount,
      currency,
      userId,
      bookingId,
      eventId,
      eventName,
    });

    res.status(200).json({
      success: true,
      url: sessionUrl,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create Stripe session",
      error: err.message,
    });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // Optional: retrieve line items, metadata, etc.
    const paymentIntentId = session.payment_intent;
    const userId = session.metadata?.userId || null;
    const bookingId = session.metadata?.bookingId || null;
    const eventId = session.metadata?.eventId || null;
    const amount = session.metadata?.amount || 0;

    const payload = {
      $set: {
        "paymentDetails.method": "stripe",
        "paymentDetails.stripePaymentIntentId": paymentIntentId,
        "paymentDetails.status": "success",
      },
    };

    try {
      const result = await bookingService.updateBooking(bookingId, payload);
      const organizerUpdate = await organizerService.updateOrganizerEarnings(
        eventId,
        amount
      );
      const eventUpdate = await eventService.updateEventEarnings(
        eventId,
        result.tickets
      );
      const user = await userService.getUserByID(userId);
      sendBookingSuccessEmail(user.email, eventUpdate.eventName, amount);

      console.log("Payment saved successfully:");
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  if (event.type === "charge.refunded") {
    const refund = event.data.object;
    const charge = event.data.object;

    // Optional safety check
    if (charge.refunds?.data?.length > 0) {
      const refundId = charge.refunds.data[0].id; // ✅ Refund ID (e.g., "re_1Xyz...")
      const result = await bookingService.updateRefundBooking(refundId);
    } else {
      console.warn("No refunds found in charge object");
    }
  }

  res.json({ received: true });
};
