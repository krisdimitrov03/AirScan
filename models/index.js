const { sequelize } = require("../config/db");
const Role = require("./Role");
const User = require("./User");
const AirportSlot = require("./AirportSlot");
const Event = require("./Event");
const Flight = require("./Flight");
const DemandHistory = require("./DemandHistory");
const Pricing = require("./Pricing");

User.belongsTo(Role, { foreignKey: "role_id" });
DemandHistory.belongsTo(Flight, { foreignKey: "flight_id" });
Pricing.belongsTo(Flight, { foreignKey: "flight_id" });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  Role,
  User,
  AirportSlot,
  Event,
  Flight,
  DemandHistory,
  Pricing,
};
