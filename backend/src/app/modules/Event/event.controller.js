const QueryBuilder = require("../../builder/QueryBuilder");
const { successResponse, errorResponse } = require("../../utils/response");
const eventService = require("./event.service");
const settingsService = require("../Settings/settings.service");
const userService = require("../User/user.service");
const newEventNoticeEmail = require("../../utils/newEventNoticeEmail");
const updateEventStatusEmail = require("../../utils/updateEventStatusEmail");
const eventRequestEmail = require("../../utils/eventRequestEmail");

exports.createEvent = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "Event image is required", 400);
    }
    const settings = await settingsService.getSettings();
    const platformCommission = settings?.globalCommissionRate || 5;

    const eventImages = req.files.map((file) => file.path);
    const event = await eventService.createEvent({
      ...req.body,
      organizerId: req.user.userId,
      eventImages,
      platformCommission: platformCommission,
    });

    // Get all super admin emails
    const allAdminsEmail = await userService.getSuperAdminEmails();

    // Send event request email to each super admin
    for (const userEmail of allAdminsEmail) {
      await eventRequestEmail(userEmail, event.eventName);
    }

    return successResponse(res, "Event created successfully", event);
  } catch (err) {
    return errorResponse(res, "Failed to create event", 500, err.message);
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const query = { ...req.query };
    const today = new Date();

    // Date filters
    if (query.today) {
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
      query.eventDate = { $gte: start, $lte: end };
      delete query.today;
    }

    if (query.thisWeek) {
      const start = new Date();
      const end = new Date();
      start.setDate(today.getDate() - today.getDay());
      end.setDate(start.getDate() + 6);
      query.eventDate = { $gte: start, $lte: end };
      delete query.thisWeek;
    }

    if (query.thisMonth) {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      query.eventDate = { $gte: start, $lte: end };
      delete query.thisMonth;
    }
    if (query.date) {
      const dateOnly = new Date(query.date);
      if (!isNaN(dateOnly)) {
        const start = new Date(dateOnly);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateOnly);
        end.setHours(23, 59, 59, 999);

        query.eventDate = { $gte: start, $lte: end };
      }
      delete query.date;
    }

    const result = await eventService.getAllEvents(query);

    return res.json({
      success: true,
      message: "Events retrieved",
      meta: result.meta,
      data: result.events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: err.message,
    });
  }
};

exports.getAllEventsByAdmin = async (req, res) => {
  try {
    const query = { ...req.query };
    const today = new Date();
    if (query.date) {
      const dateOnly = new Date(query.date);
      if (!isNaN(dateOnly)) {
        const start = new Date(dateOnly);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateOnly);
        end.setHours(23, 59, 59, 999);

        query.eventDate = { $gte: start, $lte: end };
      }
      delete query.date;
    }
    const result = await eventService.getAllEventsByAdmin(query);
    return res.json({
      success: true,
      message: "Events retrieved",
      meta: result.meta,
      data: result.events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: err.message,
    });
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

exports.getEventByOrganizer = async (req, res) => {
  try {
    const organizerId = req.user.userId;
    const events = await eventService.getEventByOrganizer(organizerId);
    if (!events)
      return errorResponse(res, "No events found for this organizer", 404);
    return successResponse(res, "Events fetched successfully", events);
  } catch (err) {
    return errorResponse(res, "Failed to fetch events", 500, err.message);
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let eventData = req.body;

    // Find the existing event first
    const existingEvent = await eventService.getEventById(req.params.id);
    if (!existingEvent) return errorResponse(res, "Event not found", 404);

    // Handle image update
    if (req.files && req.files.length > 0) {
      const eventImages = req.files.map((file) => file.path);
      eventData.eventImages = eventImages;
    } else {
      // Keep existing images if none are uploaded
      eventData.eventImages = existingEvent.eventImages;
    }

    // Proceed to update
    const updatedEvent = await eventService.updateEvent(
      req.params.id,
      eventData
    );

    return successResponse(res, "Event updated successfully", updatedEvent);
  } catch (err) {
    return errorResponse(res, "Failed to update event", 500, err.message);
  }
};

exports.updateCommisionRate = async (req, res) => {
  try {
    const { platformCommission } = req.body;
    const isSpecialCommision = true;
    const eventData = {
      platformCommission,
      isSpecialCommision,
    };
    const event = await eventService.updateEvent(req.params.id, eventData);
    if (!event) return errorResponse(res, "Event not found", 404);
    return successResponse(res, "Event commision updated successfully", event);
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

// Admin routes

exports.updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const eventId = req.params.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'approved' or 'rejected'",
      });
    }

    const updatePayload = {
      approvalStatus: {
        approved: status === "approved",
        approvedBy: req.user?.userId,
        approvedAt: new Date(),
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      },
      status: status === "approved" ? "approved" : "rejected",
    };

    const updatedEvent = await eventService.findByIdAndUpdate(
      eventId,
      updatePayload
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const organizer = await userService.getUserByID(updatedEvent.organizerId);

    // Send email to organizer about approval
    updateEventStatusEmail(
      organizer.email,
      organizer.name,
      updatedEvent.eventName,
      status
    );

    if (status === "approved") {
      // Fetch all users
      const allUsers = await userService.users();

      for (const user of allUsers) {
        if (user.role === "user") {
          const preferences = user.preferences || [];

          // Send email if no preferences set or category is included
          if (
            preferences.length === 0 ||
            preferences.includes(updatedEvent.category)
          ) {
            newEventNoticeEmail(user.email, updatedEvent.eventName);
          }
        }
      }
    }

    return res.json({
      success: true,
      message: `Event has been ${status}`,
      data: updatedEvent,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update event status",
      error: err.message,
    });
  }
};
