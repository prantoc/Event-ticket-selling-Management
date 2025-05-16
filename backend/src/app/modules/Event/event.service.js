const QueryBuilder = require("../../builder/QueryBuilder");
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

  // Base public filters
  const baseFilter = {
    status: "approved",
  };
  const eventsQuery = new QueryBuilder(
    Event.find(baseFilter).populate("organizerId eventCategory"),
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
    if (Array.isArray(event.images)) {
      event.images = event.images.map((img) => formatFileUrl(img));
    }
    return event;
  });
  return {
    events: formattedEvents,
    meta,
  };
};

exports.getAllEventsByAdmin = async (query)=>{
  const eventsQuery = new QueryBuilder(
    Event.find().populate("organizerId eventCategory"),
    query
  )
    .search(["eventName", "description", "tags"])
    .filter(["eventCategory", "eventDate","status"])
    .sort()
    .paginate()
    .fields();

  const events = await eventsQuery.modelQuery;
  const meta = await eventsQuery.countTotal();

  // Format image URLs
  const formattedEvents = events.map((event) => {
    if (Array.isArray(event.images)) {
      event.images = event.images.map((img) => formatFileUrl(img));
    }
    return event;
  });
  return {
    events: formattedEvents,
    meta,
  };
}

exports.getEventById = async (id) => {
  return await Event.findById(id).populate("organizerId eventCategory");
};

exports.getEventByOrganizer = async (organizerId) => {
  return await Event.find({ organizerId }).populate(
    "organizerId eventCategory"
  );
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
