const moment = require("moment");
const { Op } = require("sequelize");
const { Flight } = require("../models");
const { forecastFlight } = require("./forecastService");

async function forecastForSingleDate(thatDate, flights) {
  let dailySum = 0;
  for (const fl of flights) {
    const flightDeparture = moment(fl.scheduled_departure).format("YYYY-MM-DD");
    if (flightDeparture === thatDate.format("YYYY-MM-DD")) {
      const profit = await forecastFlight(fl.flight_id, 60);
      dailySum += profit;
    }
  }
  return dailySum;
}

async function getDailyForecastSeries(startDate, endDate) {
  // Grab all flights within that date range (to avoid forecasting flights far outside)
  // ergo flights that depart on or after startDate, and on or before endDate
  const flights = await Flight.findAll({
    where: {
      scheduled_departure: {
        [Op.between]: [startDate.toDate(), endDate.toDate()],
      },
    },
  });

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
