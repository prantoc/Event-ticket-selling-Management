const Organizer = require('./organizer.schema');

exports.createOrganizerProfile = async (data) => {
  return await Organizer.create(data);
};

exports.getOrganizerByUserId = async (userId) => {
  return await Organizer.findOne({ userId });
};

exports.updateOrganizerProfile = async (userId, updateData) => {
  return await Organizer.findOneAndUpdate({ userId }, updateData, { new: true });
};

exports.getAllOrganizers = async () => {
  return await Organizer.find().populate('userId', 'name email');
};

exports.approveOrganizer = async (userId, adminId) => {
  return await Organizer.findOneAndUpdate(
    { userId },
    {
      verificationStatus: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
    },
    { new: true }
  );
};

exports.rejectOrganizer = async (userId, reason, adminId) => {
  return await Organizer.findOneAndUpdate(
    { userId },
    {
      verificationStatus: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    },
    { new: true }
  );
};
