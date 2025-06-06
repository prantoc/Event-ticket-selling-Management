// services/settingsService.js
const formatFileUrl = require("../../utils/formatFileUrl");
const Setting = require("./settings.schema");
const Policy = require("./policy.schema");
const Event = require("../Event/event.schema");
const Booking = require("../Booking/booking.schema");
const User = require("../User/user.schema");
const Organizer = require("../Organizer/organizer.schema");
const Slider = require("./slider.schema");
const { getPresignedUrl } = require("../../utils/formatMinioUrl");

exports.getSettings = async () => {
  const settings = await Setting.findOne();
  if (!settings) {
    throw new Error("Settings not found");
  }

  const data = settings.toObject();

  // Replace objectName → presigned URLs
  if (data.companyLogo) {
    data.companyLogo = await getPresignedUrl(
      data.companyLogo,
      "settings-images"
    );
  }
  if (data.infoFirstImage) {
    data.infoFirstImage = await getPresignedUrl(
      data.infoFirstImage,
      "settings-images"
    );
  }
  if (data.infoSecondImage) {
    data.infoSecondImage = await getPresignedUrl(
      data.infoSecondImage,
      "settings-images"
    );
  }
  if (data.marqueeImage) {
    data.marqueeImage = await getPresignedUrl(
      data.marqueeImage,
      "settings-images"
    );
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

exports.createSlider = async (sliderData) => {
  const { image, position, title } = sliderData;
  const slider = new Slider({
    image,
    position,
    title,
  });
  return await slider.save();
};

exports.getSliders = async () => {
  const sliders = await Slider.find().sort({ position: 1 });

  const processed = await Promise.all(
    sliders.map(async (slider) => {
      let imgUrl = null;
      if (slider.image) {
        imgUrl = await getPresignedUrl(slider.image, "settings-images");
      }

      return {
        _id: slider._id,
        image: imgUrl,
        position: slider.position,
        title: slider.title || "",
      };
    })
  );

  return processed;
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

  // Revenue and Platform Commission (from Organizer earnings)
  const organizers = await Organizer.find(dateFilter);

  const totalRevenue = organizers.reduce(
    (sum, org) => sum + (org.earnings?.grossTotal || 0),
    0
  );

  const totalPlatformCommission = organizers.reduce(
    (sum, org) => sum + (org.earnings?.totalPlatformFee || 0),
    0
  );

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

exports.updateSlider = async (sliderId, updateData) => {
  const slider = await Slider.findById(sliderId);
  if (!slider) {
    throw new Error("Slider not found");
  }

  Object.assign(slider, updateData);
  return await slider.save();
};

exports.deleteSlider = async (sliderId) => {
  const slider = await Slider.findById(sliderId);
  if (!slider) {
    throw new Error("Slider not found");
  }

  await slider.deleteOne();
  return { message: "Slider deleted successfully" };
};
