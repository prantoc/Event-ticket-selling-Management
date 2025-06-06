const payoutService = require("./payout.service");

exports.createPayout = async (req, res) => {
  try {
    const organizerId = req.user.userId;

    const result = await payoutService.createPayout(organizerId);
    // const result = await payoutService.createPayout(
    //   {
    //     ...req.body,
    //     organizerId,
    //   },
    //   organizerId
    // );

    res
      .status(201)
      .json({ success: true, message: "Payout request created", data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.handleManualPayout = async (req, res) => {
  try {
    const userId = req.user.userId; // assuming authentication middleware
    const payout = await payoutService.processPayout(userId, "manual");
    res.status(200).json({ success: true, payout });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllPayouts = async (req, res) => {
  try {
    const { payouts, meta } = await payoutService.getAllPayouts(req.query);
    res.status(200).json({
      success: true,
      message: "Transaction fetched",
      data: payouts,
      meta,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePayout = async (req, res) => {
  try {
    const result = await payoutService.updatePayout(req.params.id, req.body);
    res
      .status(200)
      .json({ success: true, message: "Payout updated", data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
