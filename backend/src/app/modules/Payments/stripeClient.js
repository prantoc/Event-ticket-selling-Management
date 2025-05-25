const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(process.cwd(), ".env") });
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
