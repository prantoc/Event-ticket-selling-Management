const Payout = require("./payout.schema");
const Organizer = require("../Organizer/organizer.schema");
exports.createPayout = async (data, organizerId) => {
  const organizer = await Organizer.findOne({
    userId: organizerId,
  });

  if (!organizer) {
    throw new Error("Organizer not found");
  }

  // Ensure earnings object exists
  if (!organizer.earnings) {
    organizer.earnings = {};
  }

  // Initialize fields if they don't exist
  organizer.earnings.available = organizer.earnings.available || 0;
  organizer.earnings.pending = organizer.earnings.pending || 0;

  // Update earnings
  organizer.earnings.available -= data.amount;
  organizer.earnings.pending += data.amount;

  // // Prevent negative available balance
  if (organizer.earnings.available < 0) {
    organizer.earnings.available = 0;
  }

  await organizer.save();
  const payout = new Payout(data);
  return await payout.save();
};

exports.getAllPayouts = async (filters) => {
  const query = {};
  if (filters.organizerId) {
    query.organizerId = filters.organizerId;
  }

  return await Payout.find(query).sort({ createdAt: -1 });
};

exports.updatePayout = async (id, data) => {
  const updatedPayout = await Payout.findByIdAndUpdate(id, data, { new: true });

  // If payout is marked as completed, update organizer earnings
  if (updatedPayout.status === "completed") {
    const organizer = await Organizer.findOne({
      userId: updatedPayout.organizerId,
    });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    // Ensure earnings object exists
    if (!organizer.earnings) {
      organizer.earnings = {};
    }

    // Initialize fields if they don't exist
    organizer.earnings.pending = organizer.earnings.pending || 0;
    organizer.earnings.totalWithdraw = organizer.earnings.totalWithdraw || 0;

    // Update earnings
    organizer.earnings.pending -= updatedPayout.amount;
    organizer.earnings.totalWithdraw += updatedPayout.amount;

    // // Prevent negative available balance
    if (organizer.earnings.pending < 0) {
      organizer.earnings.pending = 0;
    }

    await organizer.save();
  }
  if (updatedPayout.status === "failed") {
    const organizer = await Organizer.findOne({
      userId: updatedPayout.organizerId,
    });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    // Ensure earnings object exists
    if (!organizer.earnings) {
      organizer.earnings = {};
    }

    // Initialize fields if they don't exist
    organizer.earnings.pending = organizer.earnings.pending || 0;
    organizer.earnings.available = organizer.earnings.available || 0;

    // Update earnings
    organizer.earnings.pending -= updatedPayout.amount;
    organizer.earnings.available += updatedPayout.amount;

    // // Prevent negative available balance
    if (organizer.earnings.pending < 0) {
      organizer.earnings.pending = 0;
    }

    await organizer.save();
  }

  return updatedPayout;
};
