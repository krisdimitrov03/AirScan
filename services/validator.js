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
    (discounts_offered !== undefined &&
      (isNaN(discounts_offered) || discounts_offered < 0)) ||
    (peak_season_surcharge !== undefined &&
      (isNaN(peak_season_surcharge) || peak_season_surcharge < 0))
  ) {
    throw new Error("Price values must be valid non-negative decimal numbers.");
  }
};

function validateDemandHistoryData(dh) {
  if (dh.historical_tickets_sold !== undefined) {
    const tickets = parseInt(dh.historical_tickets_sold, 10);
    if (isNaN(tickets) || tickets < 0) {
      throw new Error(
        "historical_tickets_sold must be a non-negative integer."
      );
    }
  }

  if (dh.historical_load_factor !== undefined) {
    const loadFactor = parseFloat(dh.historical_load_factor);
    if (isNaN(loadFactor) || loadFactor < 0 || loadFactor > 1) {
      throw new Error(
        "historical_load_factor must be a decimal between 0 and 1."
      );
    }
  }
}

const validateEventDateRange = (start_date, end_date) => {
  const startDateObj = new Date(start_date);
  const endDateObj = new Date(end_date);
  if (startDateObj > endDateObj) {
    throw new Error("Validation Error: start_date must be <= end_date.");
  }
};

const validateExpectedAdditionalTrafficFactor = (
  expected_additional_traffic_factor
) => {
  const numValue = parseFloat(expected_additional_traffic_factor);

  if (
    expected_additional_traffic_factor !== undefined &&
    (typeof numValue !== "number" ||
      isNaN(numValue) ||
      numValue < 0 ||
      numValue > 10)
  ) {
    throw new Error(
      "Validation Error: expected_additional_traffic_factor must be a numeric value between 0 and 10."
    );
  }
};

module.exports = {
  validateAirportSlotCapacityIsPositive,
  hasConflictOrOverlappingAirportSlots,
  validatePricingData,
  validateDemandHistoryData,
  validateEventDateRange,
  validateExpectedAdditionalTrafficFactor,
};
