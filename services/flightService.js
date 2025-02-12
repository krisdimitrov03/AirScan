const { Op } = require("sequelize");
const Flight = require("../models/Flight");

async function bulkCreateFlights(flightArray) {
  if (!Array.isArray(flightArray)) {
    throw new Error("Data must be an array of flight objects.");
  }
  return await Flight.bulkCreate(flightArray, { validate: true });
}

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
  return (
    "AS" +
    airportCodeToNumberString(origin) +
    airportCodeToNumberString(destination)
  );
}

async function getAllFlights() {
  return Flight.findAll();
}

async function getFlightByUUID(uuid) {
  return Flight.findByPk(uuid);
}

async function createFlight(data) {
  const flight_number = generateFlightNumber(
    data.origin_airport_code,
    data.destination_airport_code
  );
  const overlapping = await Flight.findOne({
    where: {
      flight_number,
      scheduled_departure: { [Op.lt]: data.scheduled_arrival },
      scheduled_arrival: { [Op.gt]: data.scheduled_departure },
    },
  });
  if (overlapping) {
    throw new Error(
      "A concurrent flight with the same flight number already exists."
    );
  }
  return Flight.create(data);
}

async function updateFlight(uuid, data) {
  const flight = await Flight.findByPk(uuid);
  if (!flight) return null;
  const newFlightNumber = generateFlightNumber(
    data.origin_airport_code || flight.origin_airport_code,
    data.destination_airport_code || flight.destination_airport_code
  );
  const newDeparture = data.scheduled_departure || flight.scheduled_departure;
  const newArrival = data.scheduled_arrival || flight.scheduled_arrival;
  const overlapping = await Flight.findOne({
    where: {
      flight_number: newFlightNumber,
      flight_id: { [Op.ne]: uuid },
      scheduled_departure: { [Op.lt]: newArrival },
      scheduled_arrival: { [Op.gt]: newDeparture },
    },
  });
  if (overlapping) {
    throw new Error(
      "A concurrent flight with the same flight number already exists."
    );
  }
  return flight.update(data);
}

async function deleteFlight(uuid) {
  const deletedCount = await Flight.destroy({ where: { flight_id: uuid } });
  return deletedCount === 1;
}

module.exports = {
  getAllFlights,
  getFlightByUUID,
  createFlight,
  updateFlight,
  deleteFlight,
  bulkCreateFlights,
};
