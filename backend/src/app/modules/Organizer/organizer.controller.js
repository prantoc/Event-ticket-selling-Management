const organizerService = require('./organizer.service');

// Create organizer profile
exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const data = { ...req.body, userId }; 
    const profile = await organizerService.createOrganizerProfile(data);
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get organizer profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await organizerService.getOrganizerByUserId(req.user._id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update organizer profile
exports.updateProfile = async (req, res) => {
  try {
    const updated = await organizerService.updateOrganizerProfile(req.user._id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin - Get all organizers
exports.getAllOrganizers = async (req, res) => {
  try {
    const list = await organizerService.getAllOrganizers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin - Approve organizer
exports.approve = async (req, res) => {
  try {
    const result = await organizerService.approveOrganizer(req.params.userId, req.user._id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin - Reject organizer
exports.reject = async (req, res) => {
  try {
    const result = await organizerService.rejectOrganizer(req.params.userId, req.body.reason, req.user._id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
