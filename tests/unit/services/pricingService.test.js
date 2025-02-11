const pricingService = require("../../../services/pricingService");
const { Pricing } = require("../../../models");
const validator = require("../../../services/validator");
jest.mock("../../../models", () => ({
  Pricing: { findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn(), destroy: jest.fn() },
}));
jest.mock("../../../services/validator", () => ({
  validatePricingData: jest.fn(),
}));

describe("pricingService", () => {
  afterEach(() => { jest.clearAllMocks(); });
  
  describe("getPricingById", () => {
    it("returns pricing record by id", async () => {
      const pricing = { pricing_id: 1 };
      Pricing.findByPk.mockResolvedValue(pricing);
      const result = await pricingService.getPricingById(1);
      expect(Pricing.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(pricing);
    });
  });
  
  describe("getAllPricing", () => {
    it("returns all pricing records when no flightId provided", async () => {
      const pricingRecords = [{ pricing_id: 1 }, { pricing_id: 2 }];
      Pricing.findAll.mockResolvedValue(pricingRecords);
      const result = await pricingService.getAllPricing();
      expect(Pricing.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(pricingRecords);
    });
    it("returns pricing records filtered by flightId", async () => {
      const pricingRecords = [{ pricing_id: 1, flight_id: "f1" }];
      Pricing.findAll.mockResolvedValue(pricingRecords);
      const result = await pricingService.getAllPricing("f1");
      expect(Pricing.findAll).toHaveBeenCalledWith({ where: { flight_id: "f1" } });
      expect(result).toEqual(pricingRecords);
    });
  });
  
  describe("createPricing", () => {
    it("validates and creates a pricing record", async () => {
      const pricingData = {
        flight_id: "f1",
        effective_date_range_start: "2025-01-01",
        effective_date_range_end: "2025-01-31",
        base_price: 100,
        discounts_offered: 10,
        peak_season_surcharge: 20,
      };
      const createdPricing = { pricing_id: 1, ...pricingData };
      Pricing.create.mockResolvedValue(createdPricing);
      const result = await pricingService.createPricing(pricingData);
      expect(validator.validatePricingData).toHaveBeenCalledWith(pricingData);
      expect(Pricing.create).toHaveBeenCalledWith(pricingData);
      expect(result).toEqual(createdPricing);
    });
  });
  
  describe("updatePricing", () => {
    it("validates and updates a pricing record", async () => {
      const pricingData = { base_price: 120 };
      // mock pricing instance
      const pricingInstance = { 
        pricing_id: 1, 
        base_price: 100, 
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      Pricing.findByPk.mockResolvedValue(pricingInstance);
      const result = await pricingService.updatePricing(1, pricingData);
      expect(validator.validatePricingData).toHaveBeenCalledWith(pricingData);
      expect(Pricing.findByPk).toHaveBeenCalledWith(1);
      expect(pricingInstance.update).toHaveBeenCalledWith(pricingData);
      expect(result).toMatchObject({ pricing_id: 1, base_price: 120 });
    });
    it("returns null if pricing record is not found", async () => {
      Pricing.findByPk.mockResolvedValue(null);
      const result = await pricingService.updatePricing(999, { base_price: 120 });
      expect(result).toBeNull();
    });
  });
  
  describe("deletePricing", () => {
    it("returns true if deletion is successful", async () => {
      Pricing.destroy.mockResolvedValue(1);
      const result = await pricingService.deletePricing(1);
      expect(Pricing.destroy).toHaveBeenCalledWith({ where: { pricing_id: 1 } });
      expect(result).toBe(true);
    });
    it("returns false if deletion fails", async () => {
      Pricing.destroy.mockResolvedValue(0);
      const result = await pricingService.deletePricing(999);
      expect(result).toBe(false);
    });
  });
});
