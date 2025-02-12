// services/forecastService.js
const { Op } = require("sequelize");
const moment = require("moment");
const { Flight, Pricing, Event, DemandHistory } = require("../models");
const cityToAirports = require("../config/cityToAirports"); // For mapping cities to airport codes

/*******************************************
 *    PRICE-RELATED FUNCTIONS
 *******************************************/

/**
 * ticketPrice(t, params)
 * 
 * Computes a “price” at day t before departure, factoring in:
 *  - A logistic trend (peak ~ T_mid, flattening controlled by k),
 *  - A Gaussian escalation (peak ~ mu, spread ~ sigma),
 *  - A last-minute discount (peak at t=0),
 *  - A small random variation.
 */
function ticketPrice(
  t,
  {
    base = 100,         // base price
    B = 30,             // logistic amplitude
    T_mid = 80,         // logistic midpoint ~ 80 days before flight
    k = 20,             // logistic flattening factor
    A = 100,            // amplitude for the "escalation" Gaussian
    mu = 80,            // center of the escalation
    sigma = 20,         // width of the escalation peak
    D = 30,             // amplitude of last-minute discount
    delta = 5,          // how quickly the discount decays from t=0
    priceCoeff = 1,     // overall multiplier
    randomDelta = 0.1,  // ±10% random variation
  } = {}
) {
  // Calculate the components:
  const logisticTrend = B / (1 + Math.exp((t - T_mid) / k));
  const escalation = A * Math.exp(-((t - mu) ** 2) / (2 * sigma ** 2));
  const lastMinuteDiscount = D * Math.exp(-(t ** 2) / (2 * delta ** 2));

  // Base price + adjustments:
  let price = (base + logisticTrend + escalation - lastMinuteDiscount) * priceCoeff;

  // Apply a small random variation:
  const randomFactor = 1 + (Math.random() - 0.5) * randomDelta;
  price *= randomFactor;

  return Math.max(0, price);
}

/*******************************************
 *    DEMAND (BOOKINGS) FUNCTIONS
 *******************************************/

/**
 * dailyBookings(t, params)
 * 
 * Computes the number of daily bookings at day t before departure.
 * It uses:
 *  - A logistic derivative (centered at T0, with capacity C_max and flattening k),
 *  - A last-minute spike (amplitude L, decaying with sigma_last),
 *  - A baseline so that bookings never drop fully to 0.
 */
function dailyBookings(
  t,
  {
    C_max = 1000,     // maximum capacity for the logistic
    T0 = 80,          // center ~ 80 days before flight
    k = 20,           // flattening factor for the logistic
    L = 50,           // amplitude of the last-minute spike
    sigma_last = 5,   // how quickly last-minute spike decays
    baseline = 5,     // minimal daily bookings even far from peak
    traffic_coeff = 1 // multiplier for events, etc.
  } = {}
) {
  // Compute logistic derivative portion (peak around t = T0):
  const numerator = (C_max / k) * Math.exp((t - T0) / k);
  const denominator = Math.pow(1 + Math.exp((t - T0) / k), 2);
  const logisticD = numerator / denominator;

  // Last-minute spike (big near t = 0):
  const lastMinute = L * Math.exp(-(t ** 2) / (2 * sigma_last ** 2));

  // Add a baseline:
  const daily = baseline + logisticD + lastMinute;

  return daily * traffic_coeff;
}

/**
 * expectedDailyProfit(t, priceParams, bookingParams)
 * 
 * Returns the daily profit as the product of the ticket price and daily bookings.
 */
function expectedDailyProfit(t, priceParams = {}, bookingParams = {}) {
  return ticketPrice(t, priceParams) * dailyBookings(t, bookingParams);
}

/*******************************************
 *   NUMERICAL INTEGRATION FUNCTIONS
 *******************************************/

/**
 * linspace(start, stop, num)
 *   Generate an array of num points linearly spaced from start to stop (inclusive).
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
 * trapz(x, y)
 *   Numerical integration via the trapezoidal rule.
 */
function trapz(x, y) {
  let total = 0;
  for (let i = 1; i < x.length; i++) {
    total += 0.5 * (y[i] + y[i - 1]) * (x[i] - x[i - 1]);
  }
  return total;
}

/*******************************************
 *   PROFIT CALCULATION FUNCTION
 *******************************************/

/**
 * calculateTotalExpectedWins(
 *   baseFare, seats, margin,
 *   commonPriceParams, commonBookingParams,
 *   totalDays
 * )
 * 
 * Integrates the daily profit (expected revenue) from day=0 to day=totalDays
 * for multiple seat classes (economy, business, first) and then multiplies by a margin
 * to account for net profit vs. gross revenue.
 */
function calculateTotalExpectedWins(
  baseFare,
  seats,
  margin = 0.05,
  commonPriceParams = {},
  commonBookingParams = {},
  totalDays = 60
) {
  // Limit integration to at most 160 days for demonstration purposes:
  const effectiveDays = Math.min(totalDays, 160);

  // Generate time points:
  const dayIndices = linspace(0, effectiveDays - 1, effectiveDays);
  // Subdivide the last day into hours for a smoother integration:
  const lastDayHours = linspace(effectiveDays - 1, effectiveDays, 25);
  const timePoints = dayIndices.slice(0, -1).concat(lastDayHours);

  // Define seat classes with corresponding multipliers:
  const seatClasses = [
    { count: seats.economy,  priceCoeff: 1.0 },
    { count: seats.business, priceCoeff: 1.3 },
    { count: seats.first,    priceCoeff: 2.0 },
  ];

  // Compute the expected revenue at each time point:
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
        C_max: sc.count,  // override C_max with the seat class count
      };

      sumAtT += expectedDailyProfit(t, mergedPriceParams, mergedBookingParams);
    });
    return sumAtT;
  });

  const totalRevenue = trapz(timePoints, revenueArray);
  return totalRevenue * margin;
}

/*******************************************
 *     FLIGHT FORECAST FUNCTION
 *******************************************/

/**
 * forecastFlight(flightId)
 * 
 * For a given flight (found by flightId), this function:
 *  - Computes days until departure,
 *  - Looks up the corresponding Pricing entry,
 *  - Identifies if an event in the destination city may boost demand,
 *  - Uses the profit calculations (via calculateTotalExpectedWins)
 *    to return an expected profit forecast.
 */
async function forecastFlight(flightId) {
  const flight = await Flight.findByPk(flightId);
  if (!flight) throw new Error("Flight not found");

  const now = moment();
  const departure = moment(flight.scheduled_departure);
  const daysUntilDeparture = departure.diff(now, "days");
  if (daysUntilDeparture <= 0) {
    return 0;
  }

  // Find a relevant Pricing row:
  const pricingRow = await Pricing.findOne({
    where: {
      flight_id: flightId,
      effective_date_range_start: { [Op.lte]: flight.scheduled_departure },
      effective_date_range_end:   { [Op.gte]: flight.scheduled_departure },
    },
    order: [["pricing_id", "ASC"]],
  });
  if (!pricingRow) {
    throw new Error("No matching Pricing entry for this flight/date.");
  }

  // Set seat configuration and pricing details:
  const seats = { economy: 200, business: 50, first: 20 };
  const baseFare = parseFloat(pricingRow.base_price) || 100;
  const discount = parseFloat(pricingRow.discounts_offered) || 0;
  const peakSurcharge = parseFloat(pricingRow.peak_season_surcharge) || 0;

  let trafficBoost = 1.0;

  // Determine the destination city by looking up the airport code in our dictionary:
  let destinationCity = null;
  for (const [cityName, airports] of Object.entries(cityToAirports)) {
    if (airports.includes(flight.destination_airport_code)) {
      destinationCity = cityName;
      break;
    }
  }

  // If a destination city is found, check for an event overlapping the flight date:
  if (destinationCity) {
    const possibleEvent = await Event.findOne({
      where: {
        location_city: destinationCity,
        start_date: { [Op.lte]: flight.scheduled_departure },
        end_date:   { [Op.gte]: flight.scheduled_departure },
      },
    });
    if (possibleEvent && possibleEvent.expected_additional_traffic_factor) {
      trafficBoost = possibleEvent.expected_additional_traffic_factor;
    }
  }

  // Build the price and booking parameters:
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
    randomDelta: 0.1,
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

  const margin = 0.05;

  // Calculate the forecasted profit over the remaining days until departure:
  const forecastedProfit = calculateTotalExpectedWins(
    baseFare,
    seats,
    margin,
    priceParams,
    bookingParams,
    daysUntilDeparture
  );
  return forecastedProfit;
}

module.exports = {
  ticketPrice,
  dailyBookings,
  expectedDailyProfit,
  linspace,
  trapz,
  calculateTotalExpectedWins,
  forecastFlight,
};
