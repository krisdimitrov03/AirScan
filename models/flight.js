const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flight_id: { type: Number, required: true, unique: true },
  origin_airport_code: { type: String, required: true },
  destination_airport_code: { type: String, required: true },
  direct_indirect_flag: { type: String, required: false },
  return_option_flag: { type: String, required: false },
  scheduled_departure: { type: Date, required: true },
  scheduled_arrival: { type: Date, required: true },
});

const Flight = mongoose.model("Flight", flightSchema);
module.exports = Flight;
