const { Pricing } = require("../models");
const { validatePricingData } = require("./validator");

/**
 * Get a Pricing entry by ID.
 * @param {number} pricingId - The ID of the pricing entry
 * @returns {Promise<Object|null>} - Pricing entry or null if not found
 */
const getPricingById = async (pricingId) => {
  return await Pricing.findByPk(pricingId);
};

/**
 * Get all Pricing entries (Optional: Filter by flight ID).
 * @param {string} flightId - Optional filter by flight_id
 * @returns {Promise<Array>} - List of pricing entries
 */
const getAllPricing = async (flightId = null) => {
  const filter = flightId ? { where: { flight_id: flightId } } : {};
  return await Pricing.findAll(filter);
};

/**
 * Create a new Pricing entry.
 * @param {Object} pricingData - The pricing details
 * @returns {Promise<Object>} - Created pricing entry
 */
const createPricing = async (pricingData) => {
  validatePricingData(pricingData);
  return await Pricing.create(pricingData);
};

/**
 * Update a Pricing entry.
 * @param {number} pricingId - The ID of the pricing entry
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} - Updated pricing entry or null if not found
 */
const updatePricing = async (pricingId, updateData) => {
  validatePricingData(updateData);
  const pricing = await Pricing.findByPk(pricingId);
  if (!pricing) return null;

  await pricing.update(updateData);
  return pricing;
};

/**
 * Delete a Pricing entry.
 * @param {number} pricingId - The ID of the pricing entry
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
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
};
