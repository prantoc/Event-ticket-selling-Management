const UserService = require("../User/user.service");
const organizerService = require("./organizer.service");
const settingsService = require("../Settings/settings.service");
const organizerApprovedEmail = require("../../utils/organizerApprovedEmail");
const organizerRequestEmail = require("../../utils/organizerRequestEmail");
const { client_url } = require("../../config");

// Create organizer profile
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logo = req.file ? req.file.path : null;
    const settings = await settingsService.getSettings();
    const platformCommission = settings?.globalCommissionRate || 5;
    const data = {
      ...req.body,
      userId,
      logo,
      commissionRate: platformCommission,
    };
    const profile = await organizerService.createOrganizerProfile(data);
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Failed to create organizer profile",
        error: "",
      });
    }
    // Get all super admin emails
    const allAdminsEmail = await UserService.getSuperAdminEmails();

    // Send event request email to each super admin
    for (const userEmail of allAdminsEmail) {
      await organizerRequestEmail(userEmail, profile.organizationName);
    }
    res.status(201).json({
      success: true,
      message: "Organizer created successfully",
      data: profile,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get organizer profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await organizerService.getOrganizerByUserId(
      req.user.userId
    );

    if (!profile) {
      return res.status(200).json({
        success: false,
        message: "Profile not found",
        data: [],
        error: "",
      });
    }

    res.status(200).json({
      success: true,
      message: "Organizer profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Update organizer profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = { ...req.body };

    // Only add logo if it was uploaded
    if (req.file) {
      data.logo = req.file.path;
    }

    const updated = await organizerService.updateOrganizerProfile(userId, data);
    res.json({ success: true, message: "Profile updated", data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin - Get all organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const list = await organizerService.getAllOrganizers(req.query);
    res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      data: list.organizers,
      meta: list.meta,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Admin - Approve organizer
exports.approve = async (req, res) => {
  try {
    const result = await organizerService.approveOrganizer(
      req.params.userId,
      req.user.userId
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
        error: "",
      });
    }
    const userRoleUpdate = await UserService.updateUser(req.params.userId, {
      role: "organizer",
    });
    organizerApprovedEmail(userRoleUpdate.email, userRoleUpdate.name);
    res.status(200).json({
      success: true,
      message: "Organizer approved successfully",
      data: result,
    });
  } catch (err) {
    if (err.message === "Organizer not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "",
      });
    }
    res.status(400).json({ message: err.message });
  }
};

// Admin - Reject organizer
exports.reject = async (req, res) => {
  try {
    const result = await organizerService.rejectOrganizer(
      req.params.userId,
      req.body.reason,
      req.user.userId
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
        error: "",
      });
    }
    res.status(200).json({
      success: true,
      message: "Organizer rejected successfully",
      data: result,
    });
  } catch (err) {
    if (err.message === "Organizer not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "",
      });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOrganizer = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        error: "",
      });
    }

    const deletedOrganizer = await organizerService.deleteOrganizerByUserId(
      userId
    );

    if (!deletedOrganizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
        error: "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer deleted successfully",
      data: deletedOrganizer,
    });
  } catch (err) {
    if (err.message === "Organizer not found") {
      return res.status(404).json({
        success: false,
        message: err.message,
        error: "",
      });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.getOrgnizersEarnings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const earnings = await organizerService.getOrgnizersEarnings(userId);
    if (!earnings) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
        error: "",
      });
    }
    res.status(200).json({
      success: true,
      message: "Organizer earnings fetched successfully",
      data: earnings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.checkOrganizerStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const organizer = await organizerService.getOrganizerByUserId(userId);
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "You did not create an organizer profile",
        data: { isOrganizer: false },
      });
    } else if (organizer.verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "admin did not approve your organizer profile yet",
        data: { isOrganizer: false },
      });
    }
    res.status(200).json({
      success: true,
      message: "Organizer status checked successfully",
      data: { isOrganizer: true },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.connectStripeAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const url = await organizerService.createConnectAccountLink(userId);
    res.json({ success: true, url });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
exports.disconnectStripeAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { success, message, stripeResponse } =
      await organizerService.disConnectAccount(userId);
    res.json({ success, message, data: stripeResponse });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getStripeStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await organizerService.getStripeAccountStatus(userId);
    res.json({ success: true, status });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.stripeCallback = async (req, res) => {
  // Redirect to your frontend dashboard or onboarding success page
  const FRONTEND_URL = client_url || "https://lessortiesdediane.com";

  // You can customize the redirect route as needed
  res.redirect(`${FRONTEND_URL}/stripe-success`);
};
