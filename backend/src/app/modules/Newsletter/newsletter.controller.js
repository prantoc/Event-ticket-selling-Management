
const Newsletter = require("./newsletter.schema");

// Create (Subscribe)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }

    const subscriber = await Newsletter.create({ email });
    res.status(201).json({ success: true, message: "Subscribed successfully", data: subscriber });
  } catch (err) {
    res.status(500).json({ success: false, message: "Subscription failed", error: err.message });
  }
};

// Fetch All
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.status(200).json({ success: true, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch subscribers", error: err.message });
  }
};

// Delete (Unsubscribe)
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await Newsletter.findOneAndDelete({ email });

    if (!result) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    res.status(200).json({ success: true, message: "Unsubscribed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to unsubscribe", error: err.message });
  }
};
