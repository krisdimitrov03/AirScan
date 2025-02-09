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

module.exports = {
  validateAirportSlotCapacityIsPositive,
  hasConflictOrOverlappingAirportSlots,
};
