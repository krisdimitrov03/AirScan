const moment = require("moment");
const { calculateTotalExpectedWins } = require("./forecastService");
const cityToAirports = require("../config/cityToAirports");
async function forecastNewFlight({
  origin_airport,
  destination_airport,
  departure_time,
}) {
  // 1) convert departure_time to daysUntilDeparture
  const now = moment();
  const departure = moment(departure_time);
  const daysUntilDeparture = departure.diff(now, "days");
  if (daysUntilDeparture <= 0) return 0;

  // 2) base fare and discount
  const baseFare = 200 * (0.9 * Math.random() * 0.2);
  const discount = 30 * (0.9 * Math.random() * 0.2);
  const peakSurcharge = 15 * (0.9 + Math.random() * 0.2);

  // 3) traffic boost - 1.0 for now
  let trafficBoost = 1.0;

  // 4) run the integral
  const seats = { economy: 200, business: 50, first: 20 };
  const priceCoeff = 1 + peakSurcharge / 100;
  const priceParams = {
    B: 20,
    T_mid: 60,
    k: 5,
    A: baseFare,
    mu: 60,
    sigma: 7,
    D: discount,
    delta: 0.2,
    priceCoeff,
  };
  const bookingParams = {
    T0: 25,
    k: 3,
    L: 20,
    sigma_last: 1,
    traffic_coeff: trafficBoost,
  };
  const margin = 0.05;
  return calculateTotalExpectedWins(
    baseFare,
    seats,
    margin,
    priceParams,
    bookingParams,
    daysUntilDeparture
  );
}
module.exports = { forecastNewFlight };
