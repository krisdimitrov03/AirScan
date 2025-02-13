const { Op } = require("sequelize");
const moment = require("moment");
const { Flight, Pricing, Event, DemandHistory } = require("../models");
const cityToAirports = require("../config/cityToAirports");

/**
 * Calculates the ticket price for a given day t (days before end of sale)
 * using a combination of logistic and Gaussian functions.
 */
function ticketPrice(
  t,
  {
    base = 100,
    B = 30,
    T_mid = 80,
    k = 20,
    A = 100,
    mu = 80,
    sigma = 20,
    D = 30,
    delta = 5,
    priceCoeff = 1,
    randomDelta = 0.1,
  } = {}
) {
  const logisticTrend = B / (1 + Math.exp((t - T_mid) / k));
  const escalation = A * Math.exp(-((t - mu) ** 2) / (2 * sigma ** 2));
  const lastMinuteDiscount = D * Math.exp(-(t ** 2) / (2 * delta ** 2));
  let price =
    (base + logisticTrend + escalation - lastMinuteDiscount) * priceCoeff;
  const randomFactor = 1 + (Math.random() - 0.5) * randomDelta;
  price *= randomFactor;
  return Math.max(0, price);
}

/**
 * Estimates daily bookings for day t (before end of sale).
 */
function dailyBookings(
  t,
  {
    C_max = 1000,
    T0 = 80,
    k = 20,
    L = 50,
    sigma_last = 5,
    baseline = 5,
    traffic_coeff = 1,
  } = {}
) {
  const numerator = (C_max / k) * Math.exp((t - T0) / k);
  const denominator = Math.pow(1 + Math.exp((t - T0) / k), 2);
  const logisticD = numerator / denominator;
  const lastMinute = L * Math.exp(-(t ** 2) / (2 * sigma_last ** 2));  
  const daily = baseline + logisticD + lastMinute;
  return daily * traffic_coeff;
}

/**
 * Utility: returns a linearly spaced array from start to stop (inclusive).
 */
function linspace(start, stop, num) {
  const arr = [];
  const step = (stop - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    arr.push(start + i * step);
  }
  return arr;
}

/**
 * Numerical integration using the trapezoidal rule.
 */
function trapz(x, y) {
  let total = 0;
  for (let i = 1; i < x.length; i++) {
    total += 0.5 * (y[i] + y[i - 1]) * (x[i] - x[i - 1]);
  }
  return total;
}

/**
 * Given the baseFare, seat configuration, and booking/price parameters,
 * calculates the total expected profit ("wins") over the available days.
 * Here we assume the flight is "on sale" for a fixed number of days.
 */
function calculateTotalExpectedWins(
  baseFare,
  seats,
  margin = 0.03,
  commonPriceParams = {},
  commonBookingParams = {},
  totalDays = 60 // fixed on-sale period
) {
  const dayIndices = linspace(0, totalDays - 1, totalDays);
  // Optionally break the last day into finer steps:
  const lastDayHours = linspace(totalDays - 1, totalDays, 25);
  const timePoints = dayIndices.slice(0, -1).concat(lastDayHours);

  const seatClasses = [
    { count: seats.economy, priceCoeff: 1.0 },
    { count: seats.business, priceCoeff: 1.3 },
    { count: seats.first, priceCoeff: 2.0 },
  ];

  const revenueArray = timePoints.map((t) => {
    let sumAtT = 0;
    seatClasses.forEach((sc) => {
      const mergedPriceParams = {
        ...commonPriceParams,
        base: baseFare,
        A: baseFare,
        priceCoeff: (commonPriceParams.priceCoeff || 1) * sc.priceCoeff,
      };
      const mergedBookingParams = {
        ...commonBookingParams,
        C_max: sc.count,
      };
      sumAtT +=
        ticketPrice(t, mergedPriceParams) *
        dailyBookings(t, mergedBookingParams);
    });
    return sumAtT;
  });

  const totalRevenue = trapz(timePoints, revenueArray);
  return totalRevenue * margin;
}

/**
 * Forecasts the expected profit ("wins") for a flight identified by flightId.
 * Instead of using days until departure, we use a fixed "days in market" period.
 */
async function forecastFlight(flightId, daysInMarket = 60) {
  // Retrieve the flight record.
  const flight = await Flight.findByPk(flightId);
  if (!flight) throw new Error("Flight not found");

  // Retrieve pricing information valid for the flight's scheduled departure.
  const pricingRow = await Pricing.findOne({
    where: {
      flight_id: flightId,
      effective_date_range_start: { [Op.lte]: flight.scheduled_departure },
      effective_date_range_end: { [Op.gte]: flight.scheduled_departure },
    },
    order: [["pricing_id", "ASC"]],
  });
  if (!pricingRow) return 0;

  const baseFare = parseFloat(pricingRow.base_price) || 100;
  const discount = parseFloat(pricingRow.discounts_offered) || 0;
  const peakSurcharge = parseFloat(pricingRow.peak_season_surcharge) || 0;

  // Default seat capacities.
  const seats = { economy: 200, business: 50, first: 20 };

  // Check for an event near the destination.
  let trafficBoost = 1.0;
  let destinationCity = null;
  for (const [cityName, airports] of Object.entries(cityToAirports)) {
    if (airports.includes(flight.destination_airport_code)) {
      destinationCity = cityName;
      break;
    }
  }
  if (destinationCity) {
    const possibleEvent = await Event.findOne({
      where: {
        location_city: destinationCity,
        start_date: { [Op.lte]: flight.scheduled_departure },
        end_date: { [Op.gte]: flight.scheduled_departure },
      },
    });
    if (possibleEvent && possibleEvent.expected_additional_traffic_factor) {
      trafficBoost = possibleEvent.expected_additional_traffic_factor;
    }
  }

  // Optionally incorporate recent demand history to scale traffic.
  const demandRecord = await DemandHistory.findOne({
    where: { flight_id: flightId },
    order: [["date", "DESC"]],
  });
  if (demandRecord && demandRecord.historical_load_factor) {
    trafficBoost *= demandRecord.historical_load_factor;
  }

  const priceCoeff = 1 + peakSurcharge / 100;
  const priceParams = {
    B: 30,
    T_mid: 80,
    k: 20,
    A: baseFare,
    mu: 80,
    sigma: 20,
    D: discount,
    delta: 5,
    priceCoeff,
    randomDelta: 0.0,
  };
  const bookingParams = {
    C_max: 1000,
    T0: 80,
    k: 20,
    L: 50,
    sigma_last: 5,
    baseline: 5,
    traffic_coeff: trafficBoost,
  };
  const margin = 0.03;

  const forecastedProfit = calculateTotalExpectedWins(
    baseFare,
    seats,
    margin,
    priceParams,
    bookingParams,
    daysInMarket
  );
  return forecastedProfit;
}

module.exports = {
  ticketPrice,
  dailyBookings,
  linspace,
  trapz,
  calculateTotalExpectedWins,
  forecastFlight,
};
