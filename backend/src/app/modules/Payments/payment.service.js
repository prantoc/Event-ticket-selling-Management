const stripe = require("./stripeClient");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(process.cwd(), '.env') });
exports.createStripeCheckoutSession = async ({
  amount,
  currency = "usd",
  userId,
  bookingId,
  eventId,
}) => {
  const successUrl = `${process.env.CLIENT_URL}/payment-success`;
  const cancelUrl = `${process.env.CLIENT_URL}/payment-failed`;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: "Event Ticket",
          },
          unit_amount: amount * 100, // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      bookingId,
      eventId,
    },
  });

  return session.url;
};
