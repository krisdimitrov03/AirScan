const { Event } = require("../models");
const {
  validateEventDateRange,
  validateExpectedAdditionalTrafficFactor,
} = require("./validator");

/**
 * Create a new Event
 * @param {object} eventData
 * @param {string} eventData.event_id
 * @param {string} eventData.event_name
 * @param {string} [eventData.location_city]
 * @param {string|Date} eventData.start_date
 * @param {string|Date} eventData.end_date
 * @param {number} [eventData.expected_additional_traffic_factor]
 * @returns {Promise<object>} The created event record
 */
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

/**
 * Retrieve all events
 * @returns {Promise<Array>} Array of event objects
 */
async function getAllEvents() {
  return await Event.findAll();
}

/**
 * Retrieve a single event by primary key (event_id)
 * @param {string} eventId
 * @returns {Promise<object|null>} Returns the event if found, otherwise null
 */
async function getEventById(eventId) {
  return await Event.findByPk(eventId);
}

/**
 * Update an existing event
 * @param {string} eventId
 * @param {object} updateData
 * @param {string} [updateData.event_name]
 * @param {string} [updateData.location_city]
 * @param {string|Date} [updateData.start_date]
 * @param {string|Date} [updateData.end_date]
 * @param {number} [updateData.expected_additional_traffic_factor]
 * @returns {Promise<object|null>} Updated event record, or null if not found
 */
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

/**
 * Delete an event by primary key (event_id)
 * @param {string} eventId
 * @returns {Promise<number>} The number of deleted rows (0 or 1)
 */
async function deleteEvent(eventId) {
  const deletedRows = await Event.destroy({
    where: { event_id: eventId },
  });
  return deletedRows;
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
