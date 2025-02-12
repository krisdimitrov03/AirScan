const moment = require("moment");
const { Op } = require("sequelize");
const {
  Role,
  User,
  AirportSlot,
  Event,
  Flight,
  DemandHistory,
  Pricing,
} = require("../models");

const ROLE_CONSTANTS = require("../constants/roles");

async function seedRoles() {
  const rolesData = [
    { role_id: 1, role_name: ROLE_CONSTANTS.ADMIN },
    { role_id: 2, role_name: ROLE_CONSTANTS.MANAGER },
    { role_id: 3, role_name: ROLE_CONSTANTS.ANALYST },
  ];

  if ((await Role.count()) === 0) {
    await Role.bulkCreate(rolesData);
    console.log("✅ Roles seeded successfully.");
  } else {
    console.log("⚠️ Roles already exist, skipping seeding.");
  }
}

async function seedUsers() {
  const usersData = [
    {
      username: "admin",
      password_hash:
        "$2b$10$WWtsu3kNuX22V7HnAe7oLu3Mp03fBKnlFXNJvsutrTLsJma/sDPFe",
      email: "admin@example.com",
      role_id: 1,
    },
    {
      username: "manager",
      password_hash:
        "$2b$10$X/ANs8r18zyNTz36iLNCm.rpw8sVxiAII0FFDwcd5Q4Ygs3WELajO",
      email: "manager@example.com",
      role_id: 2,
    },
    {
      username: "analyst",
      password_hash:
        "$2b$10$FGyF1W3pIDPTLzaZ4Y3u3OfQLZxJAuY2tyiti/pnfmxAeo1zDyRGC",
      email: "analyst@example.com",
      role_id: 3,
    },
  ];

  if ((await User.count()) === 0) {
    await User.bulkCreate(usersData);
    console.log("✅ Users seeded successfully.");
  } else {
    console.log("⚠️ Users already exist, skipping seeding.");
  }
}

async function seedAirportSlots() {
  const cityToAirports = require("../config/cityToAirports");
  const airportSet = new Set();
  Object.values(cityToAirports).forEach((codes) =>
    codes.forEach((code) => airportSet.add(code))
  );
  const airportCodes = Array.from(airportSet);

  const slots = [];
  [1, 2].forEach((offset) => {
    const date = moment().add(offset, "days").format("YYYY-MM-DD");
    airportCodes.forEach((code) => {
      slots.push({
        airport_code: code,
        date,
        time_slot_start: "08:00:00",
        time_slot_end: "10:00:00",
        slot_capacity: Math.floor(Math.random() * 50) + 40,
      });
      slots.push({
        airport_code: code,
        date,
        time_slot_start: "14:00:00",
        time_slot_end: "16:00:00",
        slot_capacity: Math.floor(Math.random() * 50) + 40,
      });
    });
  });

  if ((await AirportSlot.count()) === 0) {
    await AirportSlot.bulkCreate(slots);
    console.log("✅ Airport Slots seeded successfully.");
  } else {
    console.log("⚠️ Airport Slots already exist, skipping seeding.");
  }
}

async function seedEvents() {
  const currentYear = moment().year();
  const events = [
    {
      event_id: "EVT001",
      event_name: "Christmas Market",
      location_city: "London",
      start_date: `${currentYear}-12-15`,
      end_date: `${currentYear}-12-25`,
      expected_additional_traffic_factor: 1.3,
    },
    {
      event_id: "EVT002",
      event_name: "New Year's Eve Countdown",
      location_city: "New York",
      start_date: `${currentYear}-12-31`,
      end_date: `${currentYear}-12-31`,
      expected_additional_traffic_factor: 1.5,
    },
    {
      event_id: "EVT003",
      event_name: "Summer Music Festival",
      location_city: "Los Angeles",
      start_date: moment().add(60, "days").format("YYYY-MM-DD"),
      end_date: moment().add(62, "days").format("YYYY-MM-DD"),
      expected_additional_traffic_factor: 1.2,
    },
    {
      event_id: "EVT004",
      event_name: "Tech Conference",
      location_city: "San Francisco",
      start_date: moment().add(15, "days").format("YYYY-MM-DD"),
      end_date: moment().add(17, "days").format("YYYY-MM-DD"),
      expected_additional_traffic_factor: 1.4,
    },
    {
      event_id: "EVT005",
      event_name: "Art Expo",
      location_city: "Paris",
      start_date: moment().add(30, "days").format("YYYY-MM-DD"),
      end_date: moment().add(31, "days").format("YYYY-MM-DD"),
      expected_additional_traffic_factor: 1.1,
    },
  ];

  if ((await Event.count()) === 0) {
    await Event.bulkCreate(events);
    console.log("✅ Events seeded successfully.");
  } else {
    console.log("⚠️ Events already exist, skipping seeding.");
  }
}

function getHubs() {
  return [
    { code: "JFK", continent: "North America" },
    { code: "LAX", continent: "North America" },
    { code: "ORD", continent: "North America" },
    { code: "ATL", continent: "North America" },
    { code: "DFW", continent: "North America" },
    { code: "SFO", continent: "North America" },
    { code: "MIA", continent: "North America" },
    { code: "SEA", continent: "North America" },
    { code: "LHR", continent: "Europe" },
    { code: "CDG", continent: "Europe" },
    { code: "SOF", continent: "Europe" },
    { code: "AMS", continent: "Europe" },
  ];
}

function getFlightDuration(origin, destination) {
  //  same continent:
  if (origin.continent === destination.continent) {
    if (origin.continent === "Europe") {
      // short flights in Europe
      if (
        (origin.code === "LHR" && destination.code === "CDG") ||
        (origin.code === "CDG" && destination.code === "LHR")
      ) {
        return 1.5;
      }
      return parseFloat((Math.random() * 1.5 + 1.5).toFixed(1));
    } else if (origin.continent === "North America") {
      // domestic flights in U.S.
      return parseFloat((Math.random() * 4 + 2).toFixed(1)); // 2 to 6 hours
    }
  } else {
    // Intercontinental
    return parseFloat((Math.random() * 3 + 7).toFixed(1)); // 7 to 10 hours
  }
  return 3; // default
}

async function seedFlights() {
  const existingCount = await Flight.count();
  if (existingCount > 0) {
    console.log("⚠️ Flights already exist, skipping seeding.");
    return Flight.findAll();
  }

  const hubs = getHubs();
  const flights = [];
  const numFlights = 10;

  for (let i = 0; i < numFlights; i++) {
    let origin = hubs[Math.floor(Math.random() * hubs.length)];
    let destination = hubs[Math.floor(Math.random() * hubs.length)];
    while (destination.code === origin.code) {
      destination = hubs[Math.floor(Math.random() * hubs.length)];
    }
    const dayOffset = Math.floor(Math.random() * 30) + 1;
    const departureDate = moment().add(dayOffset, "days");
    const departureHour = Math.floor(Math.random() * 13) + 6; // 6-18
    const departureMinute = Math.floor(Math.random() * 60);
    const departureDateTime = departureDate
      .clone()
      .hour(departureHour)
      .minute(departureMinute)
      .second(0);

    const durationHours = getFlightDuration(origin, destination);
    const arrivalDateTime = departureDateTime
      .clone()
      .add(durationHours, "hours");

    const flight = await Flight.create({
      origin_airport_code: origin.code,
      destination_airport_code: destination.code,
      direct_indirect_flag: Math.random() > 0.5 ? "direct" : "indirect",
      return_option_flag: false,
      scheduled_departure: departureDateTime.format("YYYY-MM-DD HH:mm:ss"),
      scheduled_arrival: arrivalDateTime.format("YYYY-MM-DD HH:mm:ss"),
    });
    flights.push(flight);
  }

  console.log("✅ Flights seeded successfully.");
  return flights;
}

async function seedPricing(flights) {
  if ((await Pricing.count()) > 0) {
    console.log("⚠️ Pricing already exists, skipping seeding.");
    return;
  }

  const pricingRecords = [];
  for (const flight of flights) {
    const startDate = moment().format("YYYY-MM-DD");
    const endDate = moment().add(30, "days").format("YYYY-MM-DD");
    pricingRecords.push({
      flight_id: flight.flight_id,
      effective_date_range_start: startDate,
      effective_date_range_end: endDate,
      base_price: parseFloat((Math.random() * 200 + 200).toFixed(2)),
      discounts_offered: parseFloat((Math.random() * 30 + 20).toFixed(2)),
      peak_season_surcharge: parseFloat((Math.random() * 20 + 10).toFixed(2)),
    });
  }
  await Pricing.bulkCreate(pricingRecords);
  console.log("✅ Pricing seeded successfully.");
}

async function seedDemandHistory(flights) {
  if ((await DemandHistory.count()) > 0) {
    console.log("⚠️ Demand History already exists, skipping seeding.");
    return;
  }

  const demandRecords = [];
  for (const flight of flights) {
    const recordDate = moment().subtract(1, "days").format("YYYY-MM-DD");
    const ticketsSold = Math.floor(Math.random() * 200) + 50;
    const loadFactor = parseFloat((Math.random() * 0.4 + 0.5).toFixed(2));
    const distribution = JSON.stringify({
      business: Math.floor(Math.random() * 50) + 20,
      economy: Math.floor(Math.random() * 150) + 50,
    });
    demandRecords.push({
      flight_id: flight.flight_id,
      date: recordDate,
      historical_tickets_sold: ticketsSold,
      historical_load_factor: loadFactor,
      customer_segment_distribution: distribution,
    });
  }
  await DemandHistory.bulkCreate(demandRecords);
  console.log("✅ Demand History seeded successfully.");
}

const seedDatabase = async () => {
  try {
    console.log("🔄 Seeding database programmatically...");
    await seedRoles();
    await seedUsers();
    await seedAirportSlots();
    await seedEvents();
    const flights = await seedFlights();
    await seedPricing(flights);
    await seedDemandHistory(flights);
    console.log("✅ All models were seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase;
