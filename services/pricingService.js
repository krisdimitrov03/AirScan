const { Pricing } = require("../models");
const { validatePricingData } = require("./validator");

async function bulkCreatePricing(pricingArray) {
  if (!Array.isArray(pricingArray)) {
    throw new Error("Data must be an array of pricing objects.");
  }
  return await Pricing.bulkCreate(pricingArray, { validate: true });
}

const getPricingById = async (pricingId) => {
  return await Pricing.findByPk(pricingId);
};

const getAllPricing = async (flightId = null) => {
  const filter = flightId ? { where: { flight_id: flightId } } : {};
  return await Pricing.findAll(filter);
};

const createPricing = async (pricingData) => {
  validatePricingData(pricingData);
  return await Pricing.create(pricingData);
};

const updatePricing = async (pricingId, updateData) => {
  validatePricingData(updateData);
  const pricing = await Pricing.findByPk(pricingId);
  if (!pricing) return null;

  await pricing.update(updateData);
  return pricing;
};

const deletePricing = async (pricingId) => {
  const deletedCount = await Pricing.destroy({
    where: { pricing_id: pricingId },
  });
  return deletedCount > 0;
};

module.exports = {
  createPricing,
  getPricingById,
  getAllPricing,
  updatePricing,
  deletePricing,
  bulkCreatePricing,
};
