const validateAirportSlotCapacityIsPositive = (capacity) => {
  return !isNaN(capacity) && capacity > 0;
};

const hasConflictOrOverlappingAirportSlots = (
  allSlots,
  airport_code,
  date,
  time_slot_start,
  time_slot_end
) => {
  return allSlots.find(
    (s) =>
      s.airport_code === airport_code &&
      s.date === date &&
      time_slot_start < s.time_slot_end &&
      time_slot_end > s.time_slot_start
  );
};

const validatePricingData = (pricingData) => {
  const { base_price, discounts_offered, peak_season_surcharge } = pricingData;

  if (
    (base_price !== undefined && (isNaN(base_price) || base_price < 0)) ||
    (discounts_offered !== undefined && (isNaN(discounts_offered) || discounts_offered < 0)) ||
    (peak_season_surcharge !== undefined && (isNaN(peak_season_surcharge) || peak_season_surcharge < 0))
  ) {
    throw new Error("Price values must be valid non-negative decimal numbers.");
  }
};

module.exports = {
  validateAirportSlotCapacityIsPositive,
  hasConflictOrOverlappingAirportSlots,
  validatePricingData
};
