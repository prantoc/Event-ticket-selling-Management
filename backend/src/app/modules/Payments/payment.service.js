const stripe = require("./stripeClient");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(process.cwd(), ".env") });
exports.createStripeCheckoutSession = async ({
  amount,
  currency = "usd",
  userId,
  bookingId,
  eventId,
  eventName,
}) => {
  console.log("Event id found in payment service:", eventId);
  
  const successUrl = `${process.env.CLIENT_URL}/payment-success`;
  const cancelUrl = `${process.env.CLIENT_URL}/payment-failed`;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: eventName || "Event Ticket",
            description: `Booking ID: ${bookingId || "N/A"}, Event ID: ${
              eventId || "N/A"
            }`,
          },
          unit_amount: amount * 100,
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
      amount,
    },
  });

  return session.url;
};
