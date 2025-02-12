// services/ephemeralForecast.js
const moment = require("moment");
const { Event } = require("../models");
const cityToAirports = require("../config/cityToAirports");
const { calculateTotalExpectedWins } = require("./forecastService");
const { Op } = require("sequelize");

async function forecastNewFlight({
  origin_airport,
  destination_airport,
  departure_time,
}) {
  const now = moment();
  const departure = moment(departure_time);
  const daysUntilDeparture = departure.diff(now, "days");
  if (daysUntilDeparture <= 0) return 0;

  const baseFare = 200 + Math.random() * 150;
  const discount = 10 + Math.random() * 30;
  const peakSurcharge = 10 + Math.random() * 15;

  // assume a default flight duration of 3 hours for ephemeral flights:
  const arrival = moment(departure).add(3, "hours");

  // check for special event in the destination around ARRIVAL date
  let trafficBoost = 1.0;
  let matchingCity = null;

  for (const [cityName, airports] of Object.entries(cityToAirports)) {
    if (airports.includes(destination_airport)) {
      matchingCity = cityName;
      break;
    }
  }

  if (matchingCity) {
    const arrivalDate = arrival.format("YYYY-MM-DD");
    const possibleEvent = await Event.findOne({
      where: {
        location_city: matchingCity,
        start_date: { [Op.lte]: arrivalDate },
        end_date: { [Op.gte]: arrivalDate },
      },
    });
    if (possibleEvent && possibleEvent.expected_additional_traffic_factor) {
      trafficBoost = possibleEvent.expected_additional_traffic_factor;
    }
  }

  // prepare integral parameters
  const seats = { economy: 200, business: 50, first: 20 };
  const priceCoeff = 1 + peakSurcharge / 100;

  const priceParams = {
    B: 20, // logistic amplitude
    T_mid: 30, // shift the logistic so peak is around 30 days
    k: 4, // flattening factor
    A: baseFare, // amplitude for the Gaussian part
    mu: 30, // center for the escalation ~ 30 days
    sigma: 10, // width of the escalation
    D: discount, // last-minute discount amplitude
    delta: 3, // how quickly discount decays
    priceCoeff,
    randomDelta: 0.2, // up to ±20% random variation on price
  };

  const bookingParams = {
    T0: 30, // logistic peak for daily bookings around 30 days out
    k: 5, // flattening factor for daily booking curve
    L: 50, // amplitude for a last-minute “spike”
    sigma_last: 3, // how quickly the last-minute spike decays
    baseline: 5, // minimal daily bookings
    traffic_coeff: trafficBoost,
  };

  const margin = 0.03;

  const totalProfit = calculateTotalExpectedWins(
    baseFare,
    seats,
    margin,
    priceParams,
    bookingParams,
    daysUntilDeparture
  );

  return totalProfit;
}

module.exports = { forecastNewFlight };
