// services/settingsService.js
const formatFileUrl = require("../../utils/formatFileUrl");
const Setting = require("./settings.schema");
const Policy = require("./policy.schema");
const Event = require("../Event/event.schema");
const Booking = require("../Booking/booking.schema");
const User = require("../User/user.schema");
const Organizer = require("../Organizer/organizer.schema");

exports.getSettings = async () => {
  const settings = await Setting.findOne();

  if (!settings) {
    // Just throw an error and handle it in the controller
    throw new Error("Settings not found");
  }

  const data = settings.toObject();

  // ✅ Format companyLogo URL
  if (data.companyLogo) {
    data.companyLogo = formatFileUrl(data.companyLogo);
  }

  return data;
};

exports.updateSettings = async (data) => {
  const existing = await Setting.findOne();
  if (existing) {
    Object.assign(existing, data);
    return await existing.save();
  } else {
    const setting = new Setting(data);
    return await setting.save();
  }
};

exports.getPolicies = async (filter = {}) => {
  const query = {};
  if (filter.page) {
    query.page = filter.page;
  }

  return await Policy.find(query).select("-__v");
};

exports.upsertPolicy = async (policyData) => {
  const { page, content, effectiveDate } = policyData;

  const updated = await Policy.findOneAndUpdate(
    { page },
    { content, effectiveDate },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return updated;
};

const getDateRange = (filter) => {
  const now = new Date();
  let fromDate = null;

  switch (filter) {
    case "7d":
      fromDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "30d":
      fromDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case "90d":
      fromDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case "year":
      fromDate = new Date(now.getFullYear(), 0, 1); // Jan 1st of this year
      break;
    case "all":
    default:
      fromDate = null;
  }

  return fromDate;
};

exports.getAdminDashboardStats = async (filter = "all") => {
  const fromDate = getDateRange(filter);
  const dateFilter = fromDate ? { createdAt: { $gte: fromDate } } : {};

  // Fetch events
  const totalEvents = await Event.countDocuments(dateFilter);
  const totalActiveEvents = await Event.countDocuments({
    ...dateFilter,
    status: "approved",
  });

  // Organizers
  const totalOrganizers = await Organizer.countDocuments(dateFilter);
  const activeOrganizers = await Organizer.countDocuments({
    ...dateFilter,
    verificationStatus: "approved",
  });

  // Users
  const totalUsers = await User.countDocuments({
    ...dateFilter,
    role: "user",
  });

  // Revenue
  const bookings = await Booking.find({
    ...dateFilter,
    "paymentDetails.status": "success",
  });

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.paymentDetails?.totalAmount || 0),
    0
  );

  const totalPlatformCommission = await Booking.aggregate([
    {
      $match: {
        ...dateFilter,
        "paymentDetails.status": "success",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$paymentDetails.platformFee" },
      },
    },
  ]).then((res) => res[0]?.total || 0);

  // Pending approvals
  const pendingEvents = await Event.countDocuments({
    ...dateFilter,
    status: "pending-approval",
  });
  const pendingOrganizers = await Organizer.countDocuments({
    ...dateFilter,
    verificationStatus: "pending",
  });

  // Refund requests pending
  const pendingRefunds = await Booking.countDocuments({
    ...dateFilter,
    "refundDetails.status": "pending",
  });

  return {
    totalEvents,
    totalActiveEvents,
    totalOrganizers,
    activeOrganizers,
    totalUsers,
    totalRevenue,
    totalPlatformCommission,
    pendingEvents,
    pendingOrganizers,
    pendingRefunds,
  };
};
