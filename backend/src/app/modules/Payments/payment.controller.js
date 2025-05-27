const paymentService = require("./payment.service");
const bookingService = require("../Booking/booking.service");
const organizerService = require("../Organizer/organizer.service");
const stripe = require("./stripeClient");
const dotenv = require("dotenv");
const path = require("path");
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
      console.log("Payment saved successfully:");
       console.log("Saving payment for booking ID and payload:", eventId,amount);
      const organizerUpdate = organizerService.updateOrganizerEarnings(
        eventId,
        amount
      );
      console.log("Organizer earnings updated successfully:",organizerUpdate);
      
      
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  }

  res.json({ received: true });
};
