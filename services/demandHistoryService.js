const DemandHistory = require("../models/DemandHistory");
const Flight = require("../models/Flight");
const { validateDemandHistoryData } = require("./validator");

async function bulkCreateDemandHistory(dataArray) {
  if (!Array.isArray(dataArray)) {
    throw new Error("Data must be an array of demand history objects.");
  }
  return await DemandHistory.bulkCreate(dataArray, { validate: true });
}

async function getAllDemandHistory() {
  return DemandHistory.findAll();
}

async function getDemandHistoryById(id) {
  return DemandHistory.findByPk(id);
}

async function createDemandHistory(data) {
  validateDemandHistoryData(data);
  const flight = await Flight.findByPk(data.flight_id);
  if (!flight) throw new Error("Invalid flight_id — flight does not exist.");

  return DemandHistory.create({
    flight_id: data.flight_id,
    date: data.date,
    historical_tickets_sold: data.historical_tickets_sold,
    historical_load_factor: data.historical_load_factor,
    economy_segment_sold: data.economy_segment_sold,
    business_segment_sold: data.business_segment_sold,
    first_segment_sold: data.first_segment_sold,
  });
}

async function updateDemandHistory(id, data) {
  validateDemandHistoryData(data);

  const existing = await DemandHistory.findByPk(id);
  if (!existing) return null;

  if (data.flight_id !== undefined) {
    const flight = await Flight.findByPk(data.flight_id);
    if (!flight) throw new Error("Invalid flight_id — flight does not exist.");
  }

  return existing.update({
    flight_id: data.flight_id,
    date: data.date,
    historical_tickets_sold: data.historical_tickets_sold,
    historical_load_factor: data.historical_load_factor,
    economy_segment_sold: data.economy_segment_sold,
    business_segment_sold: data.business_segment_sold,
    first_segment_sold: data.first_segment_sold,
  });
}

async function deleteDemandHistory(id) {
  const deletedCount = await DemandHistory.destroy({
    where: { record_id: id },
  });
  return deletedCount === 1;
}

module.exports = {
  getAllDemandHistory,
  getDemandHistoryById,
  createDemandHistory,
  updateDemandHistory,
  deleteDemandHistory,
  bulkCreateDemandHistory,
};
