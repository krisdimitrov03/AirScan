const moment = require("moment");
const { Op } = require("sequelize");
const { Flight } = require("../models");
const { forecastFlight } = require("./forecastService");

async function forecastForSingleDate(thatDate, flights) {
  let dailySum = 0;
  for (const fl of flights) {
    // Compare just the 'YYYY-MM-DD' part
    const flightDeparture = moment(fl.scheduled_departure).format("YYYY-MM-DD");
    if (flightDeparture === thatDate.format("YYYY-MM-DD")) {
      // Forecast for this flight (any approach you like)
      const profit = await forecastFlight(fl.flight_id, 60);
      dailySum += profit;
    }
  }
  return dailySum;
}

/**
 * For each day in [startDate..endDate], sum the forecast of flights departing that day.
 * Returns { labels: [...], data: [...] } for Chart.js usage.
 */
async function getDailyForecastSeries(startDate, endDate) {
  // 1) Grab all flights within that date range (to avoid forecasting flights far outside)
  //    i.e. flights that depart on or after startDate, and on or before endDate
  const flights = await Flight.findAll({
    where: {
      scheduled_departure: {
        [Op.between]: [startDate.toDate(), endDate.toDate()],
      },
    },
  });

  // 2) Iterate from startDate to endDate day by day
  const labels = [];
  const data = [];

  const current = moment(startDate);
  while (current.isSameOrBefore(endDate, "day")) {
    labels.push(current.format("YYYY-MM-DD"));
    const daySum = await forecastForSingleDate(current, flights);
    data.push(parseFloat(daySum.toFixed(2)));
    current.add(1, "day");
  }

  return { labels, data };
}

/**
 * Returns the earliest flight date and the latest flight date in the DB.
 */
async function getEarliestAndLatestFlightDates() {
  const earliestFlight = await Flight.findOne({
    order: [["scheduled_departure", "ASC"]],
  });
  const latestFlight = await Flight.findOne({
    order: [["scheduled_departure", "DESC"]],
  });
  if (!earliestFlight || !latestFlight) {
    return null;
  }
  return {
    earliest: moment(earliestFlight.scheduled_departure),
    latest: moment(latestFlight.scheduled_departure),
  };
}

module.exports = {
  getDailyForecastSeries,
  getEarliestAndLatestFlightDates,
};
