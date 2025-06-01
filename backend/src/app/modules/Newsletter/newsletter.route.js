// routes/newsletter.routes.js

const express = require("express");
const router = express.Router();
const newsletterController = require("./newsletter.controller");

// Subscribe
router.post("/subscribe", newsletterController.subscribe);
router.post("/sendemail", newsletterController.sendEmail);

// Get all subscribers
router.get("/", newsletterController.getAllSubscribers);

// Unsubscribe
router.delete("/unsubscribe/:email", newsletterController.unsubscribe);

module.exports = router;
