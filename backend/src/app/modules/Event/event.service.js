const QueryBuilder = require("../../builder/QueryBuilder");
const formatFileUrl = require("../../utils/formatFileUrl");
const Event = require("./event.schema");

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

  const eventsQuery = new QueryBuilder(
    Event.find(baseFilter)
      .populate({
        path: "organizerId",
        select: "name email",
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
  const formattedEvents = events.map((event) => {
    if (event.eventCategory) {
      event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
    }
    if (Array.isArray(event.eventImages)) {
      event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
    }
    return event;
  });

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
  }
  const eventsQuery = new QueryBuilder(
    Event.find()
      .populate({
        path: "organizerId",
        select: "name email",
      })
      .populate("eventCategory"),
    query
  )
    .search(["eventName", "description", "tags"])
    .filter(["eventCategory", "eventDate", "status"])
    .sort()
    .paginate()
    .fields();

  const events = await eventsQuery.modelQuery;
  const meta = await eventsQuery.countTotal();

  // Format image URLs
  const formattedEvents = events.map((event) => {
    if (event.eventCategory) {
      event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
    }

    if (Array.isArray(event.eventImages)) {
      event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
    }
    return event;
  });

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
    })
    .populate("eventCategory");
  if (!event) return null;
  if (Array.isArray(event.eventImages)) {
    event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
  }
  if (event.eventCategory) {
    event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
  }
  return event;
};

exports.getEventByOrganizer = async (organizerId) => {
  const events = await Event.find({ organizerId })
    .populate({
      path: "organizerId",
      select: "name email",
    })
    .populate("eventCategory");
  const formattedEvents = events.map((event) => {
    if (event.eventCategory) {
      event.eventCategory.icon = formatFileUrl(event.eventCategory?.icon);
    }
    if (Array.isArray(event.eventImages)) {
      event.eventImages = event.eventImages.map((img) => formatFileUrl(img));
    }
    return event;
  });
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

exports.deleteEvent = async (id) => {
  return await Event.findByIdAndDelete(id);
};
