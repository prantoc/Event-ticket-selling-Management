const paymentService = require("./payment.service");
const stripe = require("./stripeClient");

exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      amount,
      currency,
      userId,
      bookingId,
      eventId,
    } = req.body;

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

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Optional: retrieve line items, metadata, etc.
    const paymentIntentId = session.payment_intent;
    const userId = session.metadata?.userId || null;
    const bookingId = session.metadata?.bookingId || null;
    const eventId = session.metadata?.eventId || null;

    try {
      await Payment.create({
        userId,
        bookingId,
        eventId,
        paymentIntentId,
        amount: session.amount_total / 100,
        currency: session.currency,
        status: "succeeded",
      });
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  res.json({ received: true });
};
