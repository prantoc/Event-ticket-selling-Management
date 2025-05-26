const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");

router.post("/create-checkout-session", paymentController.createCheckoutSession);
// Stripe webhook route
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);
module.exports = router;
