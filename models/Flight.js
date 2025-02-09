const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Flight = sequelize.define(
  "Flight",
  {
    flight_id: { type: DataTypes.STRING(50), primaryKey: true },
    origin_airport_code: { type: DataTypes.STRING(10), allowNull: false },
    destination_airport_code: { type: DataTypes.STRING(10), allowNull: false },
    direct_indirect_flag: {
      type: DataTypes.ENUM("direct", "indirect"),
      defaultValue: "direct",
    },
    return_option_flag: { type: DataTypes.BOOLEAN, defaultValue: false },
    scheduled_departure: { type: DataTypes.DATE },
    scheduled_arrival: { type: DataTypes.DATE },
  },
  { tableName: "flights", timestamps: false }
);

module.exports = Flight;
