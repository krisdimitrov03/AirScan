const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/airscanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB - seeding data...");
  try {
    const flightSchema = new mongoose.Schema({
      flight_id: Number,
      origin_airport_code: String,
      destination_airport_code: String,
      direct_indirect_flag: String,
      return_option_flag: String,
      scheduled_departure: Date,
      scheduled_arrival: Date,
    });
    const Flight = mongoose.model("Flight", flightSchema);

    await Flight.deleteMany({});

    await Flight.insertMany([
      {
        flight_id: 1,
        origin_airport_code: "JFK",
        destination_airport_code: "LAX",
        direct_indirect_flag: "D",
        return_option_flag: "N",
        scheduled_departure: new Date("2021-10-01T08:00:00"),
        scheduled_arrival: new Date("2021-10-01T11:00:00"),
      },
      {
        flight_id: 2,
        origin_airport_code: "LAX",
        destination_airport_code: "JFK",
        direct_indirect_flag: "D",
        return_option_flag: "N",
        scheduled_departure: new Date("2021-10-01T12:00:00"),
        scheduled_arrival: new Date("2021-10-01T15:00:00"),
      },
      {
        flight_id: 3,
        origin_airport_code: "JFK",
        destination_airport_code: "LAX",
        direct_indirect_flag: "D",
        return_option_flag: "N",
        scheduled_departure: new Date("2021-10-01T16:00:00"),
        scheduled_arrival: new Date("2021-10-01T19:00:00"),
      },
      {
        flight_id: 4,
        origin_airport_code: "LAX",
        destination_airport_code: "JFK",
        direct_indirect_flag: "D",
        return_option_flag: "N",
        scheduled_departure: new Date("2021-10-01T20:00:00"),
        scheduled_arrival: new Date("2021-10-01T23:00:00"),
      },
    ]);

    console.log("Sample flights added successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
});
