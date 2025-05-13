const { backend_url } = require("../../config");
const formatFileUrl = require("../../utils/formatFileUrl");
const Organizer = require("./organizer.schema");

exports.createOrganizerProfile = async (data) => {
  return await Organizer.create(data);
};

exports.getOrganizerByUserId = async (userId) => {
  const data = await Organizer.findOne({ userId }).lean(); // use .lean() for plain object
  if (!data) return null;

  // Format the logo path to include full URL
  if (data.logo) {
    data.logo = formatFileUrl(data.logo);
  }
  return data;
};

exports.updateOrganizerProfile = async (userId, updateData) => {
  return await Organizer.findOneAndUpdate({ userId }, updateData, {
    new: true,
  });
};

exports.getAllOrganizers = async () => {
  return await Organizer.find().populate("userId", "name email");
};

exports.approveOrganizer = async (userId, adminId) => {
  return await Organizer.findOneAndUpdate(
    { userId },
    {
      verificationStatus: "approved",
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
      verificationStatus: "rejected",
      rejectionReason: reason,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    },
    { new: true }
  );
};


exports.deleteOrganizerByUserId = async (userId) => {
  const deleted = await Organizer.findOneAndDelete({ userId });
  return deleted;
};