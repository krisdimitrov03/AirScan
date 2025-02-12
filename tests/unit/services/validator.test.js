const {
  validateAirportSlotCapacityIsPositive,
  hasConflictOrOverlappingAirportSlots,
  validatePricingData,
  validateEventDateRange,
  validateExpectedAdditionalTrafficFactor,
} = require("../../../services/validator");

describe("validator", () => {
  describe("validateAirportSlotCapacityIsPositive", () => {
    it("returns true for a positive integer", () => {
      expect(validateAirportSlotCapacityIsPositive(5)).toBe(true);
    });
    it("returns false for zero or negative numbers", () => {
      expect(validateAirportSlotCapacityIsPositive(0)).toBe(false);
      expect(validateAirportSlotCapacityIsPositive(-3)).toBe(false);
    });
    it("returns false for non-numeric input", () => {
      expect(validateAirportSlotCapacityIsPositive("abc")).toBe(false);
    });
  });

  describe("hasConflictOrOverlappingAirportSlots", () => {
    const slots = [
      {
        airport_code: "LAX",
        date: "2025-12-01",
        time_slot_start: "10:00:00",
        time_slot_end: "12:00:00",
      },
      {
        airport_code: "JFK",
        date: "2025-12-01",
        time_slot_start: "13:00:00",
        time_slot_end: "15:00:00",
      },
    ];
    it("returns a conflicting slot when overlap exists", () => {
      const conflict = hasConflictOrOverlappingAirportSlots(
        slots,
        "LAX",
        "2025-12-01",
        "11:00:00",
        "13:00:00"
      );
      expect(conflict).toBeDefined();
    });
    it("returns undefined when there is no conflict", () => {
      const conflict = hasConflictOrOverlappingAirportSlots(
        slots,
        "LAX",
        "2025-12-01",
        "08:00:00",
        "09:00:00"
      );
      expect(conflict).toBeUndefined();
    });
  });

  describe("validatePricingData", () => {
    it("does not throw for valid pricing data", () => {
      const validData = {
        base_price: 100,
        discounts_offered: 10,
        peak_season_surcharge: 20,
      };
      expect(() => validatePricingData(validData)).not.toThrow();
    });
    it("throws an error for invalid pricing data", () => {
      const invalidData = {
        base_price: -100,
        discounts_offered: 10,
        peak_season_surcharge: 20,
      };
      expect(() => validatePricingData(invalidData)).toThrow(
        "Price values must be valid non-negative decimal numbers."
      );
    });
  });

  describe("validateEventDateRange", () => {
    it("does not throw if start_date <= end_date", () => {
      expect(() =>
        validateEventDateRange("2025-01-01", "2025-01-02")
      ).not.toThrow();
    });
    it("throws an error if start_date > end_date", () => {
      expect(() => validateEventDateRange("2025-01-03", "2025-01-02")).toThrow(
        "Validation Error: start_date must be <= end_date."
      );
    });
  });

  describe("validateExpectedAdditionalTrafficFactor", () => {
    it("does not throw for a valid factor", () => {
      expect(() => validateExpectedAdditionalTrafficFactor(5)).not.toThrow();
    });
    it("throws an error for invalid values (<0 or >10)", () => {
      expect(() => validateExpectedAdditionalTrafficFactor(-1)).toThrow(
        "Validation Error: expected_additional_traffic_factor must be a numeric value between 0 and 10."
      );
      expect(() => validateExpectedAdditionalTrafficFactor(11)).toThrow(
        "Validation Error: expected_additional_traffic_factor must be a numeric value between 0 and 10."
      );
    });
  });
});
