const Event = require("../models/eventModel");

exports.createEvent = async (req, res, next) => {
  const event = await Event.create(req.body);

  if (!event) {
    res.status(404).json({
      status: "Error",
      message: "Not able to create event",
    });
  }

  res.status(200).json({
    status: "success",
    data: event,
  });
};

exports.getAllEvent = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const events = await Event.find().skip(skip).limit(limit);

  const allEventType = await Event.distinct("eventType");

  if (!events) {
    res.status(404).json({
      status: "Error",
      message: "Not able to create events",
    });
  }
  res.status(200).json({
    status: "success",
    length: events.length,
    page,
    totalPages: Math.ceil((await Event.countDocuments()) / limit),
    eventType: allEventType,
    data: events,
  });
};

exports.getEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const id = eventId.split("=")[1];
  console.log(id);

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      status: "Error",
      message: "Error while fetching info",
    });
  }
  res.status(200).json({
    status: "success",
    message: "Data Fetched Successfully",
    data: event,
  });
};

exports.getParticularData = async (req, res, next) => {
  const { eventType, startDate, endDate } = req.query;

  let query = {};

  if (eventType) {
    query.eventType = { $in: eventType.split(",") };
  }

  try {
    const events = await Event.find(query);

    res.status(200).json({
      status: "success",
      message: "Data Fetched Successfully",
      length: events.length,
      data: events,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
