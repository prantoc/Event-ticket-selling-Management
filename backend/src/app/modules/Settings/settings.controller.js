// controllers/settingsController.js
const settingsService = require("./settings.service");

exports.getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    console.log("checking response: ");
    
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      // Assuming you're uploading company logo via multer and storing relative path
      data.companyLogo = req.file.path;
    }

    const updated = await settingsService.updateSettings(data);
    res.json({ success: true, message: "Settings updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const policies = await settingsService.getPolicies(req.query);
    return res.status(200).json({
      success: true,
      message: "Policy retrived successfully",
      data: policies,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch policies",
      error: err.message,
    });
  }
};

exports.upsertPolicy = async (req, res) => {
  try {
    const updatedPolicy = await settingsService.upsertPolicy(req.body);
    return res.status(200).json({
      success: true,
      message: "Policy saved successfully",
      data: updatedPolicy,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to save policy",
      error: err.message,
    });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const filter = req.query.range || "all"; // ?range=7d / 30d / 90d / year / all
    const stats = await settingsService.getAdminDashboardStats(filter);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard stats",
      message: err.message,
    });
  }
};
