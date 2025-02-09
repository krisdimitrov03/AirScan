const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    event_id: { type: DataTypes.STRING(50), primaryKey: true },
    event_name: { type: DataTypes.STRING, allowNull: false },
    location_city: { type: DataTypes.STRING },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    expected_additional_traffic_factor: { type: DataTypes.FLOAT },
  },
  { tableName: "events", timestamps: false }
);

module.exports = Event;
