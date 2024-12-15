const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const db = new sqlite3.Database("./airline.db");

function loadCSVIntoTable(csvFile, tableName, columns) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${columns
        .map(() => "?")
        .join(",")})`
    );
    fs.createReadStream(path.join(__dirname, "data", csvFile))
      .pipe(csv())
      .on("data", (row) => {
        const values = columns.map((col) => row[col]);
        stmt.run(values);
      })
      .on("end", () => {
        stmt.finalize();
        resolve();
      })
      .on("error", reject);
  });
}

async function loadAllData() {
  await loadCSVIntoTable("airport_slots.csv", "airport_slots", [
    "airport_code",
    "date",
    "time_slot_start",
    "time_slot_end",
    "slot_capacity",
  ]);
  await loadCSVIntoTable("events.csv", "events", [
    "event_id",
    "event_name",
    "location_city",
    "start_date",
    "end_date",
    "expected_additional_traffic_factor",
  ]);
  await loadCSVIntoTable("demand_history.csv", "demand_history", [
    "flight_id",
    "date",
    "historical_tickets_sold",
    "historical_load_factor",
    "customer_segment_distribution",
  ]);
  await loadCSVIntoTable("flights.csv", "flights", [
    "flight_id",
    "origin_airport_code",
    "destination_airport_code",
    "direct_indirect_flag",
    "return_option_flag",
    "scheduled_departure",
    "scheduled_arrival",
  ]);
  await loadCSVIntoTable("pricing.csv", "pricing", [
    "flight_id",
    "effective_date_range_start",
    "effective_date_range_end",
    "base_price",
    "discounts_offered",
    "peak_season_surcharge",
  ]);
  db.close();
}

loadAllData();
