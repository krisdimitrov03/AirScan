const AirportSlot = require('../models/AirportSlot');

/**
 * Get all airport slots
 * @returns {Promise<Array<AirportSlot>>}
 */
async function getAllSlots() {
  return await AirportSlot.findAll();
}

/**
 * Get an airport slot by its slot_id
 * @param {number} slotId
 * @returns {Promise<AirportSlot | null>}
 */
async function getSlotById(slotId) {
  return await AirportSlot.findByPk(slotId);
}

/**
 * Create a new airport slot
 * @param {string} slotData.airport_code
 * @param {string} slotData.date         - Format: YYYY-MM-DD
 * @param {string} slotData.time_slot_start - Format: HH:mm:ss
 * @param {string} slotData.time_slot_end   - Format: HH:mm:ss
 * @param {number} slotData.slot_capacity
 * @returns {Promise<AirportSlot>}
 */
async function createSlot(slotData) {
  return await AirportSlot.create(slotData);
}

/**
 * Update an existing airport slot
 * @param {number} slotId - The slot_id to update
 * @param {Object} slotData - Fields to update
 * @returns {Promise<AirportSlot | null>}
 */
async function updateSlot(slotId, slotData) {
  const slot = await AirportSlot.findByPk(slotId);
  if (!slot) return null;

  return await slot.update(slotData);
}

/**
 * Delete an airport slot
 * @param {number} slotId 
 * @returns {Promise<boolean>} - True if a record was deleted, false if none found
 */
async function deleteSlot(slotId) {
  const deletedCount = await AirportSlot.destroy({ where: { slot_id: slotId } });
  return deletedCount === 1; 
}

module.exports = {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
};
