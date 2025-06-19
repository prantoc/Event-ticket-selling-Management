const QueryBuilder = require("../../builder/QueryBuilder");
const { backend_url } = require("../../config");
const formatFileUrl = require("../../utils/formatFileUrl");
const Organizer = require("./organizer.schema");
const Event = require("../Event/event.schema");
const stripe = require("../Payments/stripeClient");
const dotenv = require("dotenv");
const path = require("path");
const allowedCountries = require("../../utils/allowedCountries");
const { getPresignedUrl } = require("../../utils/formatMinioUrl");
dotenv.config({ path: path.join(process.cwd(), ".env") });

exports.createOrganizerProfile = async (data) => {
  return await Organizer.create(data);
};

exports.getOrganizerByUserId = async (userId) => {
  const data = await Organizer.findOne({ userId }).lean();
  if (!data) return null;
  if (data.logo) {
    // data.logo = formatFileUrl(data.logo);
    data.logo = await getPresignedUrl(data.logo, "organizer-images");
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

  const formattedOrganizers = await Promise.all(
    filteredOrganizers.map(async (organizer) => {
      const data = organizer.toObject();
      if (data.logo) {
        data.logo = await getPresignedUrl(data.logo, "organizer-images");
      }
      return data;
    })
  );

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

exports.updateOrganizerEarnings = async (eventId, amount = 0) => {
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
    Number(organizer.earnings.grossTotal || 0) + Number(grossTotal);

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
    organizationName: organizer?.organizationName,
    grossTotal: organizer?.earnings?.grossTotal || 0,
    totalPlatformFee: organizer?.earnings?.totalPlatformFee || 0,
    totalNetEarning: organizer?.earnings?.total || 0,
    availableBalance: organizer?.earnings?.available || 0,
    pending: organizer?.earnings?.pending || 0,
    totalWithdraw: organizer?.earnings?.totalWithdraw || 0,
  };

  return {
    earnings,
  };
};

exports.createConnectAccountLink = async (userId) => {
  const redirectUrl = `${process.env.BACKEND_URL}/api/v1/organizers/stripe/callback`;
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) throw new Error("Organizer profile not found");

  // Extract and validate country
  let country = (organizer.address?.iso2 || "FR").toUpperCase();
  if (!allowedCountries.includes(country)) {
    throw new Error(`Unsupported country '${country}' for Stripe Connect.`);
  }

  const email = organizer.email || "no-reply@example.com";

  if (!organizer.stripeConnectAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
    });

    organizer.stripeConnectAccountId = account.id;
    await organizer.save();
  }

  const accountLink = await stripe.accountLinks.create({
    account: organizer.stripeConnectAccountId,
    refresh_url: redirectUrl,
    return_url: redirectUrl,
    type: "account_onboarding",
  });

  return accountLink.url;
};

exports.disConnectAccount = async (userId) => {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer profile not found");
  }

  const stripeAccountId = organizer.stripeConnectAccountId;

  if (!stripeAccountId) {
    throw new Error("No Stripe Connect account to disconnect");
  }

  try {
    // Revoke the account via Stripe OAuth

    // Clear saved Stripe account in DB
    organizer.stripeConnectAccountId = null;
    const resutl = await organizer.save();

    return {
      success: true,
      message: "Stripe Connect account disconnected successfully",
      stripeResponse: resutl,
    };
  } catch (err) {
    console.error(
      "Stripe disconnection error:",
      err.response?.data || err.message
    );
    throw new Error("Failed to disconnect Stripe account");
  }
};

exports.getStripeAccountStatus = async (userId) => {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer || !organizer.stripeConnectAccountId) {
    throw new Error("Stripe Connect account not found for organizer.");
  }

  const account = await stripe.accounts.retrieve(
    organizer.stripeConnectAccountId
  );

  return {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    requirements: account.requirements,
    country: account.country,
    email: account.email,
    capabilities: account.capabilities,
  };
};
