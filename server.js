const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { title: "Airline Dashboard" });
});

app.get("/flights", (req, res) => {
  const db = new sqlite3.Database("./airline.db");
  db.all("SELECT * FROM flights LIMIT 10", [], (err, rows) => {
    if (err) return res.status(500).send("Error retrieving data");
    res.render("index", { title: "Flights", flights: rows });
  });
  db.close();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
