const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AirportSlot = sequelize.define(
  "AirportSlot",
  {
    slot_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    airport_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time_slot_start: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    time_slot_end: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    slot_capacity: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "airport_slots",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["airport_code", "date", "time_slot_start"],
      },
    ],
  }
);

module.exports = AirportSlot;
