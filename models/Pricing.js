const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Flight = require("./Flight");

const Pricing = sequelize.define(
  "Pricing",
  {
    pricing_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    flight_id: {
      type: DataTypes.STRING(50),
      references: { model: Flight, key: "flight_id" },
      allowNull: false,
    },
    effective_date_range_start: { type: DataTypes.DATEONLY, allowNull: false },
    effective_date_range_end: { type: DataTypes.DATEONLY, allowNull: false },
    base_price: { type: DataTypes.DECIMAL(10, 2) },
    discounts_offered: { type: DataTypes.DECIMAL(10, 2) },
    peak_season_surcharge: { type: DataTypes.DECIMAL(10, 2) },
  },
  { tableName: "pricing", timestamps: false }
);

module.exports = Pricing;
