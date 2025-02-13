const { Event } = require("../models");
const {
  validateEventDateRange,
  validateExpectedAdditionalTrafficFactor,
} = require("./validator");
const { Op } = require("sequelize");

async function bulkCreateEvents(eventArray) {
  if (!Array.isArray(eventArray)) {
    throw new Error("Data must be an array of event objects.");
  }
  return await Event.bulkCreate(eventArray, { validate: true });
}

async function createEvent(eventData) {
  const {
    event_id,
    event_name,
    location_city,
    start_date,
    end_date,
    expected_additional_traffic_factor,
  } = eventData;

  validateEventDateRange(start_date, end_date);
  validateExpectedAdditionalTrafficFactor(expected_additional_traffic_factor);

  const newEvent = await Event.create({
    event_id,
    event_name,
    location_city,
    start_date,
    end_date,
    expected_additional_traffic_factor,
  });

  return newEvent;
}

async function getAllEvents() {
  return await Event.findAll();
}

async function getAllEventsBy({ search = "", limit = 50, offset = 0 } = {}) {
  const whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { event_id: { [Op.like]: `%${search}%` } },
      { event_name: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Event.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["start_date", "ASC"]],
  });

  return { rows, count };
}

async function getEventById(eventId) {
  return await Event.findByPk(eventId);
}
async function updateEvent(eventId, updateData) {
  if (updateData.start_date && updateData.end_date) {
    validateEventDateRange(updateData.start_date, updateData.end_date);
  }

  if (updateData.expected_additional_traffic_factor) {
    validateExpectedAdditionalTrafficFactor(
      updateData.expected_additional_traffic_factor
    );
  }

  const event = await Event.findByPk(eventId);
  if (!event) {
    return null;
  }

  await event.update(updateData);
  return event;
}

async function deleteEvent(eventId) {
  const deletedRows = await Event.destroy({
    where: { event_id: eventId },
  });
  return deletedRows;
}

module.exports = {
  createEvent,
  getAllEvents,
  getAllEventsBy,
  getEventById,
  updateEvent,
  deleteEvent,
  bulkCreateEvents,
};
