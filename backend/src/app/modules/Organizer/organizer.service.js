const QueryBuilder = require("../../builder/QueryBuilder");
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

exports.getAllOrganizers = async (query) => {
  const organizersQuery = new QueryBuilder(Organizer.find().populate("userId", "name email"), query)
    .filter(["verificationStatus"])
    .sort()
    .paginate()
    .fields();

  const organizers = await organizersQuery.modelQuery;
  const meta = await organizersQuery.countTotal();

  // Manual filtering based on userId.name, userId.email, and organizationName
  let filteredOrganizers = organizers;

  if (query.searchTerm) {
    const searchText = query.searchTerm.toLowerCase();
    filteredOrganizers = organizers.filter((organizer) => {
      const orgName = organizer.organizationName?.toLowerCase() || "";
      const userName = organizer.userId?.name?.toLowerCase() || "";
      const userEmail = organizer.userId?.email?.toLowerCase() || "";

      return (
        orgName.includes(searchText) ||
        userName.includes(searchText) ||
        userEmail.includes(searchText)
      );
    });
  }

  const formattedOrganizers = filteredOrganizers.map((organizer) => {
    const data = organizer.toObject();
    if (data.logo) {
      data.logo = formatFileUrl(data.logo);
    }
    return data;
  });

  return {
    organizers: formattedOrganizers,
    meta,
  };
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
