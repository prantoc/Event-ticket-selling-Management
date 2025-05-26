const paymentService = require("./payment.service");
const bookingService = require("../Booking/booking.service");
const stripe = require("./stripeClient");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(process.cwd(), '.env') });

exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, userId, bookingId, eventId } = req.body;

    const sessionUrl = await paymentService.createStripeCheckoutSession({
      amount,
      currency,
      userId,
      bookingId,
      eventId,
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
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("Received Stripe webhook event:", event);

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout session completed:", session);
    // Optional: retrieve line items, metadata, etc.
    const paymentIntentId = session.payment_intent;
    const userId = session.metadata?.userId || null;
    const bookingId = session.metadata?.bookingId || null;
    const eventId = session.metadata?.eventId || null;

    const payload = {
      paymentDetails: {
        method: "stripe",
        stripePaymentIntentId: paymentIntentId,
        status: "succeeded",
      },
    };

    try {
      const result = await bookingService.updateBooking(bookingId, payload);
      console.log("Booking updated successfully:", result);
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  res.json({ received: true });
};
