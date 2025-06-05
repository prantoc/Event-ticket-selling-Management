// controllers/settingsController.js
const settingsService = require("./settings.service");
const path = require("path");

// Utility to get relative path
const getRelativePath = (fullPath) => {
  const normalized = fullPath.split(path.sep).join("/"); // normalize Windows paths
  const index = normalized.indexOf("store/images/");
  return index !== -1 ? normalized.substring(index) : fullPath;
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();

    res.json({ success: true, message: "Fetched settings", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const data = { ...req.body };
    // Example for fields
    const logoUrl = req.minioFiles.companyLogo?.[0];
    const firstImgUrl = req.minioFiles.infoFirstImage?.[0];
    const secondImgUrl = req.minioFiles.infoSecondImage?.[0];
    const marqueeImgUrl = req.minioFiles.marqueeImage?.[0];

    if (logoUrl) {
      data.companyLogo = logoUrl;
    }

    if (firstImgUrl) {
      data.infoFirstImage = firstImgUrl;
    }
    if (secondImgUrl) {
      data.infoSecondImage = secondImgUrl;
    }
    if (marqueeImgUrl) {
      data.marqueeImage = marqueeImgUrl;
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

exports.createSlider = async (req, res) => {
  try {
    const logoUrl = req.minioFiles?.image;
    const sliderData = {
      image: logoUrl,
      position: req.body.position || 0,
      title: req.body.title || "",
    };

    const slider = await settingsService.createSlider(sliderData);
    res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: slider,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create slider",
      error: err.message,
    });
  }
};

exports.getSlider = async (req, res) => {
  try {
    const sliders = await settingsService.getSliders();
    res.status(200).json({
      success: true,
      message: "Sliders fetched successfully",
      data: sliders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
      error: err.message,
    });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const sliderId = req.params.id;
    const updateData = {
      position: req.body.position,
      title: req.body.title || "",
    };
    const logoUrl = req.minioFiles?.image;

    if (logoUrl) {
      console.log(logoUrl);

      updateData.image = logoUrl;
    }

    const updatedSlider = await settingsService.updateSlider(
      sliderId,
      updateData
    );
    res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: updatedSlider,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update slider",
      error: err.message,
    });
  }
};
exports.deleteSlider = async (req, res) => {
  try {
    const sliderId = req.params.id;
    await settingsService.deleteSlider(sliderId);
    res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete slider",
      error: err.message,
    });
  }
};
