const Event = require('./event.schema');

exports.createEvent = async (eventData) => {
  return await Event.create(eventData);
};

exports.getAllEvents = async (filter = {}) => {
  return await Event.find(filter).populate('organizerId eventCategory');
};

exports.getEventById = async (id) => {
  return await Event.findById(id).populate('organizerId eventCategory');
};

exports.updateEvent = async (id, updateData) => {
  return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deleteEvent = async (id) => {
  return await Event.findByIdAndDelete(id);
};
