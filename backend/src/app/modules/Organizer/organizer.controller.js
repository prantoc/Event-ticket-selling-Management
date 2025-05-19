const UserService = require("../User/user.service");
const organizerService = require("./organizer.service");

// Create organizer profile
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logo = req.file ? req.file.path : null;
    const data = { ...req.body, userId, logo };
    const profile = await organizerService.createOrganizerProfile(data);
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Failed to create organizer profile",
        error: "",
      });
    }
    const userRoleUpdate = await UserService.updateUser(userId, {
      role: "organizer",
    });
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get organizer profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await organizerService.getOrganizerByUserId(
      req.user.userId
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
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
    const updated = await organizerService.updateOrganizerProfile(
      req.user.userId,
      req.body
    );
    res.json({ success: true, message: "Profile updatedd", data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin - Get all organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const list = await organizerService.getAllOrganizers();
    if (!list || list.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No organizers found",
        error: "",
      });
    }

    res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      data: list,
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
