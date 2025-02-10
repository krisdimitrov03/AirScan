const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

function airportCodeToNumberString(code) {
  code = code.toUpperCase();
  let result = "";
  for (let i = 0; i < code.length; i++) {
    let index = code.charCodeAt(i) - 65 + 1; // A = 1
    if (index >= 0 && index < 10) result += "0" + index;
    if (index >= 10 && index < 26) result += index;
  }
  return result;
}

function generateFlightNumber(origin, destination) {
  const originDigits = airportCodeToNumberString(origin);
  const destinationDigits = airportCodeToNumberString(destination);
  return "AS" + originDigits + destinationDigits;
}

const Flight = sequelize.define("Flight", {
  flight_uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flight_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // there can be different flights with the same number, just not the same uuid
  },
  origin_airport_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  destination_airport_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  direct_indirect_flag: {
    type: DataTypes.ENUM("direct", "indirect"),
    defaultValue: "direct"
  },
  return_option_flag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduled_departure: {
    type: DataTypes.DATE
  },
  scheduled_arrival: {
    type: DataTypes.DATE
  }
}, {
  tableName: "flights",
  timestamps: false,
  hooks: {
    beforeCreate: (flight) => {
      if (!flight.origin_airport_code || !flight.destination_airport_code)
        throw new Error("Origin and destination codes are required");
      
      flight.flight_number = generateFlightNumber(
        flight.origin_airport_code,
        flight.destination_airport_code
      );
    },
    beforeUpdate: (flight) => {
      if (!flight.origin_airport_code || !flight.destination_airport_code)
        throw new Error("Origin and destination codes are required");
      flight.flight_number = generateFlightNumber(
        flight.origin_airport_code,
        flight.destination_airport_code
      );
    }
  }
});

module.exports = Flight;
