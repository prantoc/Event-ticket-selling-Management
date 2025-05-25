const express = require("express");
const router = express.Router();
const controller = require("./payment.controller");

// Stripe webhook route
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }), // IMPORTANT for Stripe!
  controller.handleStripeWebhook
);

module.exports = router;
