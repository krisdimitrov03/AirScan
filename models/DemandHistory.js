const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Flight = require("./Flight");

const DemandHistory = sequelize.define(
  "DemandHistory",
  {
    record_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    flight_id: {
      type: DataTypes.UUID,
      references: { model: Flight, key: "flight_id" },
      allowNull: false,
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    historical_tickets_sold: { type: DataTypes.INTEGER },
    historical_load_factor: { type: DataTypes.FLOAT },
    customer_segment_distribution: { type: DataTypes.TEXT },
  },
  { tableName: "demand_history", timestamps: false }
);

module.exports = DemandHistory;
