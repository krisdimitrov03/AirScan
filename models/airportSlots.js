const mongoose = require("mongoose");
const airportSlotSchema = new mongoose.Schema({
  airport_code: { type: String, required: true },
  date: { type: Date, required: true },
  time_slot_start: { type: String },
  time_slot_end: { type: String },
  slot_capacity: { type: Number },
});
module.exports = mongoose.model("AirportSlot", airportSlotSchema);
