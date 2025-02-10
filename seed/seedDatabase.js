const loadJsonData = require("../util/loadJsonData");
const {
  Role,
  User,
  Flight,
  AirportSlot,
  Event,
  DemandHistory,
  Pricing,
} = require("../models");

const seedTable = async (
  model,
  dataFilePath,
  modelName,
  flights = undefined
) => {
  try {
    const count = await model.count();
    if (count === 0) {
      let data = loadJsonData(dataFilePath);

      if (flights) data = await mapToFlights(data, flights);

      const returnedData = await model.bulkCreate(data);
      console.log(`✅ ${modelName} seeded successfully`);
      return returnedData;
    } else {
      console.log(`⚠️ ${modelName} already exists, skipping seeding`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error seeding ${modelName}:`, error);
    return [];
  }
};

const mapToFlights = async (records, flights) => {
  for (let index = 0; index < records.length; index++)
    records[index].flight_id = flights[index].flight_id;

  return records;
};

const seedDatabase = async () => {
  try {
    console.log("🔄 Seeding database...");

    await seedTable(Role, "./data/roles.json", "Roles");
    await seedTable(User, "./data/users.json", "Users");
    await seedTable(AirportSlot, "./data/airport_slots.json", "Airport Slots");
    await seedTable(Event, "./data/events.json", "Events");

    const flights = await seedTable(Flight, "./data/flights.json", "Flights");
    await seedTable(
      DemandHistory,
      "./data/demand_history.json",
      "Demand History",
      flights
    );
    await seedTable(Pricing, "./data/pricing.json", "Pricing", flights);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase;
