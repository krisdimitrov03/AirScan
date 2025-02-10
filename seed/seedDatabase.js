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

const seedTable = async (model, dataFilePath, modelName) => {
  try {
    const count = await model.count();
    if (count === 0) {
      const data = loadJsonData(dataFilePath);
      await model.bulkCreate(data);
      console.log(`✅ ${modelName} seeded successfully`);
    } else {
      console.log(`⚠️ ${modelName} already exists, skipping seeding`);
    }
  } catch (error) {
    console.error(`❌ Error seeding ${modelName}:`, error);
  }
};

const seedDatabase = async () => {
  try {
    console.log("🔄 Seeding database...");

    await seedTable(Role, "./data/roles.json", "Roles");
    await seedTable(User, "./data/users.json", "Users");
    await seedTable(Flight, "./data/flights.json", "Flights");
    await seedTable(AirportSlot, "./data/airport_slots.json", "Airport Slots");
    await seedTable(Event, "./data/events.json", "Events");
    await seedTable(
      DemandHistory,
      "./data/demand_history.json",
      "Demand History"
    );
    await seedTable(Pricing, "./data/pricing.json", "Pricing");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase;
