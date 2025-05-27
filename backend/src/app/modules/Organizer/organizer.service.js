const QueryBuilder = require("../../builder/QueryBuilder");
const { backend_url } = require("../../config");
const formatFileUrl = require("../../utils/formatFileUrl");
const Organizer = require("./organizer.schema");
const Event = require("../Event/event.schema");

exports.createOrganizerProfile = async (data) => {
  return await Organizer.create(data);
};

exports.getOrganizerByUserId = async (userId) => {
  const data = await Organizer.findOne({ userId }).lean();
  if (!data) return null;
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
  const organizersQuery = new QueryBuilder(
    Organizer.find().populate("userId", "name email"),
    query
  )
    .filter(["verificationStatus"])
    .sort()
    .paginate()
    .fields();

  const organizers = await organizersQuery.modelQuery;
  const meta = await organizersQuery.countTotal();
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

exports.updateOrganizerEarnings = async ({ eventId, amount = 0 }) => {
  console.log("Updating organizer earnings for event:", eventId, "with amount:", amount);
  
  if (!eventId) throw new Error("Event ID is required");

  // Find event and organizer
  const event = await Event.findById(eventId);
  if (!event || !event.organizerId)
    throw new Error("Event or Organizer not found");

  const organizer = await Organizer.findOne({
    userId: event.organizerId,
  });
  if (!organizer) throw new Error("Organizer not found");

  const grossTotal = amount;
  const totalPlatformFee = (amount * (event.platformCommission || 5)) / 100;
  const netEarnings = grossTotal - totalPlatformFee;

  // Initialize earnings if missing
  if (!organizer.earnings) {
    organizer.earnings = {};
  }

  organizer.earnings.grossTotal =
    (organizer.earnings.grossTotal || 0) + grossTotal;
  organizer.earnings.totalPlatformFee =
    (organizer.earnings.totalPlatformFee || 0) + totalPlatformFee;
  organizer.earnings.total = (organizer.earnings.total || 0) + netEarnings;
  organizer.earnings.available =
    (organizer.earnings.available || 0) + netEarnings;

  await organizer.save();
  return organizer.earnings;
};

exports.getOrgnizersEarnings = async (userId) => {
  const organizer = await Organizer.findOne({ userId }).lean();
  if (!organizer) return null;

  const earnings = {
    organizationName: organizer.organizationName,
    grossTotal: organizer.earnings.grossTotal || 0,
    totalPlatformFee: organizer.earnings.totalPlatformFee || 0,
    totalNetEarning: organizer.earnings.total,
    availableBalance: organizer.earnings.available,
    pending: organizer.earnings.pending,
    totalWithdraw: organizer.earnings.totalWithdraw || 0,
  };

  return {
    earnings,
  };
};
