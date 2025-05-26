const express = require("express");
const router = express.Router();
const controller = require("./payment.controller");

// Stripe webhook route
router.post("/stripe-webhook", controller.handleStripeWebhook);

module.exports = router;
