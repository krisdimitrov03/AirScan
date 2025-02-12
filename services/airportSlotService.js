const AirportSlot = require("../models/AirportSlot");

async function bulkCreateAirportSlots(slotArray) {
  if (!Array.isArray(slotArray)) {
    throw new Error("Data must be an array of airport slot objects.");
  }
  return await AirportSlot.bulkCreate(slotArray, { validate: true });
}

async function getAllSlots() {
  return await AirportSlot.findAll();
}

async function getSlotById(slotId) {
  return await AirportSlot.findByPk(slotId);
}

async function createSlot(slotData) {
  return await AirportSlot.create(slotData);
}

async function updateSlot(slotId, slotData) {
  const slot = await AirportSlot.findByPk(slotId);
  if (!slot) return null;

  return await slot.update(slotData);
}

async function deleteSlot(slotId) {
  const deletedCount = await AirportSlot.destroy({
    where: { slot_id: slotId },
  });
  return deletedCount === 1;
}

module.exports = {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  bulkCreateAirportSlots,
};
