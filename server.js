const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  const flights = [
    {
      flight_id: 1,
      origin_airport_code: "JFK",
      destination_airport_code: "LAX",
      direct_indirect_flag: "D",
      return_option_flag: "N",
      scheduled_departure: "2021-10-01 08:00:00",
      scheduled_arrival: "2021-10-01 11:00:00",
    },
    {
      flight_id: 2,
      origin_airport_code: "LAX",
      destination_airport_code: "JFK",
      direct_indirect_flag: "D",
      return_option_flag: "N",
      scheduled_departure: "2021-10-01 12:00:00",
      scheduled_arrival: "2021-10-01 15:00:00",
    },
    {
      flight_id: 3,
      origin_airport_code: "JFK",
      destination_airport_code: "LAX",
      direct_indirect_flag: "D",
      return_option_flag: "N",
      scheduled_departure: "2021-10-01 16:00:00",
      scheduled_arrival: "2021-10-01 19:00:00",
    },
    {
      flight_id: 4,
      origin_airport_code: "LAX",
      destination_airport_code: "JFK",
      direct_indirect_flag: "D",
      return_option_flag: "N",
      scheduled_departure: "2021-10-01 20:00:00",
      scheduled_arrival: "2021-10-01 23:00:00",
    },
  ];
  console.log(flights);
  res.render("index", { title: "Airline Dashboard", flights });
});

app.get("/flights", (req, res) => {
  const db = new sqlite3.Database("./airline.db");
  db.all("SELECT * FROM flights LIMIT 10", [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).send("Error retrieving data");
    }
    res.render("index", { title: "Flights", flights: rows });
    db.close();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
