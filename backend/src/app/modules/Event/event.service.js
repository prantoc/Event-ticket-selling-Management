const QueryBuilder = require("../../builder/QueryBuilder");
const formatFileUrl = require("../../utils/formatFileUrl");
const { getPresignedUrl } = require("../../utils/formatMinioUrl");
const Event = require("./event.schema");
const mongoose = require("mongoose");
exports.createEvent = async (eventData) => {
  return await Event.create(eventData);
};

exports.getAllEvents = async (query) => {
  const searchableFields = ["eventName", "description", "tags"];
  const filterableFields = [
    "eventCategory",
    "eventDate",
    "month",
    "date",
    "thisWeek",
    "thisMonth",
    "today",
    // Remove city from regular filterable fields since we'll handle it separately
    // "venue.address.city",
  ];

  // Sanitize empty string filters
  for (const key in query) {
    if (query[key] === "") {
      delete query[key];
    }
  }

  // Base public filters
  const baseFilter = {
    status: "approved",
    eventDate: { $gte: new Date() },
  };

  // Handle case-insensitive city filtering
  if (query.city || query["venue.address.city"]) {
    const cityValue = query.city || query["venue.address.city"];
    baseFilter["venue.address.city"] = {
      $regex: new RegExp(`^${cityValue.trim()}$`, "i"), // Case-insensitive exact match
    };

    // Remove city from query object to prevent duplicate filtering
    delete query.city;
    delete query["venue.address.city"];
  }

  const eventsQuery = new QueryBuilder(
    Event.find(baseFilter)
      .populate({
        path: "organizerId",
        select: "name email",
        populate: {
          path: "organizerProfile",
          select: "organizationName logo website",
        },
      })
      .populate("eventCategory"),
    query
  )
    .search(searchableFields)
    .filter(filterableFields)
    .sort()
    .paginate()
    .fields();

  const events = await eventsQuery.modelQuery;
  const meta = await eventsQuery.countTotal();

  // Format image URLs
  // const formattedEvents = events.map((event) => {
  //   if (event.eventCategory) {
  //     event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
  //   }
  //   if (Array.isArray(event.eventImages)) {
  //     event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
  //   }
  //   return event;
  // });
  const formattedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.eventCategory?.icon) {
        // Adjust bucket name if different
        event.eventCategory.icon = await getPresignedUrl(
          event.eventCategory.icon,
          "event-category-icons"
        );
      }

      if (Array.isArray(event.eventImages)) {
        event.eventImages = await Promise.all(
          event.eventImages.map((img) => getPresignedUrl(img, "event-images"))
        );
      }

      return event;
    })
  );

  return {
    events: formattedEvents,
    meta,
  };
};

exports.getAllEventsByAdmin = async (query) => {
  // Sanitize empty string filters
  for (const key in query) {
    if (query[key] === "") {
      delete query[key];
    }
    // Convert "true"/"false" strings to actual booleans
    if (key === "isSpecialCommision") {
      if (query[key] === "true") query[key] = true;
      else if (query[key] === "false") query[key] = false;
    }
  }
  const eventsQuery = new QueryBuilder(
    Event.find()
      .populate({
        path: "organizerId",
        select: "name email",
        populate: {
          path: "organizerProfile",
          select: "organizationName logo website",
        },
      })
      .populate("eventCategory"),
    query
  )
    .search(["eventName", "description", "tags"])
    .filter(["eventCategory", "eventDate", "status", "isSpecialCommision"])
    .sort()
    .paginate()
    .fields();

  const events = await eventsQuery.modelQuery;
  const meta = await eventsQuery.countTotal();

  // Format image URLs
  // const formattedEvents = events.map((event) => {
  //   if (event.eventCategory) {
  //     event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
  //   }

  //   if (Array.isArray(event.eventImages)) {
  //     event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
  //   }
  //   return event;
  // });
  const formattedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.eventCategory?.icon) {
        // Adjust bucket name if different
        event.eventCategory.icon = await getPresignedUrl(
          event.eventCategory.icon,
          "event-category-icons"
        );
      }

      if (Array.isArray(event.eventImages)) {
        event.eventImages = await Promise.all(
          event.eventImages.map((img) => getPresignedUrl(img, "event-images"))
        );
      }

      return event;
    })
  );

  return {
    events: formattedEvents,
    meta,
  };
};

exports.getEventById = async (id) => {
  const event = await Event.findById(id)
    .populate({
      path: "organizerId",
      select: "name email",
      populate: {
        path: "organizerProfile",
        select: "organizationName logo website",
      },
    })
    .populate("eventCategory");

  if (!event) return null;

  // Clone to plain object
  const eventObj = event.toObject();

  // Format event images
  if (Array.isArray(eventObj.eventImages)) {
    eventObj.eventImages = await Promise.all(
      eventObj.eventImages.map((img) => getPresignedUrl(img, "event-images"))
    );
  }

  // Format organizer logo
  const logo = eventObj.organizerId?.organizerProfile?.logo;
  if (logo) {
    eventObj.organizerId.organizerProfile.logo = await getPresignedUrl(
      logo,
      "organizer-images"
    );
  }

  // Format event category icon
  const icon = eventObj.eventCategory?.icon;
  if (icon) {
    eventObj.eventCategory.icon = await getPresignedUrl(
      icon,
      "event-category-icons" // Change to your actual bucket name
    );
  }

  // ✅ Calculate total tickets
  const totalTickets = eventObj.ticketTiers.reduce((sum, tier) => {
    const available = tier.availableQuantity || 0;
    const sold = tier.sold || 0;
    return sum + available + sold;
  }, 0);

  eventObj.totalTickets = totalTickets;

  return eventObj;
};

exports.getEventByOrganizer = async (organizerId) => {
  const events = await Event.find({ organizerId })
    .populate({
      path: "organizerId",
      select: "name email",
    })
    .populate("eventCategory");
  // const formattedEvents = events.map((event) => {
  //   if (event.eventCategory) {
  //     event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
  //   }
  //   if (Array.isArray(event.eventImages)) {
  //     event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
  //   }
  //   return event;
  // });

  const formattedEvents = await Promise.all(
    events.map(async (event) => {
      if (event.eventCategory?.icon) {
        // Adjust bucket name if different
        event.eventCategory.icon = await getPresignedUrl(
          event.eventCategory.icon,
          "event-category-icons"
        );
      }

      if (Array.isArray(event.eventImages)) {
        event.eventImages = await Promise.all(
          event.eventImages.map((img) => getPresignedUrl(img, "event-images"))
        );
      }

      return event;
    })
  );

  return formattedEvents;
};

exports.findByIdAndUpdate = async (eventId, updatePayload) => {
  return await Event.findByIdAndUpdate(eventId, updatePayload, {
    new: true,
  });
};

exports.updateEvent = async (id, updateData) => {
  return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

exports.updateEventEarnings = async (eventId, tickets) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    let totalTicketsSold = 0;
    let totalRevenue = 0;

    for (const ticket of tickets) {
      const { ticketTierId, quantity, totalPrice } = ticket;

      const tier = event.ticketTiers.id(ticketTierId); // Corrected from ._id() to .id()
      if (!tier) throw new Error(`Ticket tier not found: ${ticketTierId}`);

      tier.sold += quantity;
      tier.availableQuantity -= quantity;

      totalTicketsSold += quantity;
      totalRevenue += totalPrice;
    }

    // Ensure analytics field is initialized
    if (!event.analytics) {
      event.analytics = {
        totalTciketsSold: 0,
        totalSale: 0,
      };
    }

    event.analytics.totalTciketsSold += totalTicketsSold;
    event.analytics.totalSale += totalRevenue;

    await event.save();

    console.log("Event earnings updated successfully.");
    return event;
  } catch (err) {
    console.error("Failed to update event earnings:", err);
    throw err;
  }
};

exports.deleteEvent = async (id) => {
  return await Event.findByIdAndDelete(id);
};
