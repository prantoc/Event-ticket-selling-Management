const { successResponse, errorResponse } = require('../../utils/response');
const eventService = require('./event.service');

exports.createEvent = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
        return errorResponse(res, "Event image is required", 400);
        }
    const eventImages = req.files.map((file) => file.path);
    const event = await eventService.createEvent({ ...req.body, organizerId: req.user.userId, eventImages });
    return successResponse(res, "Event created successfully", event);
  } catch (err) {
    return errorResponse(res, "Failed to create event", 500, err.message);
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    return successResponse(res, "All events fetched", events);
  } catch (err) {
    return errorResponse(res, "Failed to fetch events", 500, err.message);
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return errorResponse(res, "Event not found", 404);
    return successResponse(res, "Event details fetched", event);
  } catch (err) {
    return errorResponse(res, "Failed to fetch event", 500, err.message);
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) return errorResponse(res, "Event not found", 404);
    return successResponse(res, "Event updated successfully", event);
  } catch (err) {
    return errorResponse(res, "Failed to update event", 500, err.message);
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    if (!event) return errorResponse(res, "Event not found", 404);
    return successResponse(res, "Event deleted successfully", event);
  } catch (err) {
    return errorResponse(res, "Failed to delete event", 500, err.message);
  }
};
