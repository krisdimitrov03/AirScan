const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./airline.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS airport_slots (
    airport_code TEXT,
    date TEXT,
    time_slot_start TEXT,
    time_slot_end TEXT,
    slot_capacity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    event_id TEXT,
    event_name TEXT,
    location_city TEXT,
    start_date TEXT,
    end_date TEXT,
    expected_additional_traffic_factor REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS demand_history (
    flight_id TEXT,
    date TEXT,
    historical_tickets_sold INTEGER,
    historical_load_factor REAL,
    customer_segment_distribution TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS flights (
    flight_id TEXT,
    origin_airport_code TEXT,
    destination_airport_code TEXT,
    direct_indirect_flag TEXT,
    return_option_flag TEXT,
    scheduled_departure TEXT,
    scheduled_arrival TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pricing (
    flight_id TEXT,
    effective_date_range_start TEXT,
    effective_date_range_end TEXT,
    base_price REAL,
    discounts_offered REAL,
    peak_season_surcharge REAL
  )`);
});

db.close();
