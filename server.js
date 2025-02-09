const express = require("express");
const mongoose = require("mongoose");

const Flight = require("./models/flight");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/airscanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

app.get("/", async (req, res) => {
  try {
    const flights = await Flight.find().limit(10).exec();
    res.render("index", { title: "Airline Dashboard", flights });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving data from MongoDB");
  }
});

app.get("/flights", async (req, res) => {
  try {
    const flights = await Flight.find().exec();
    res.render("index", { title: "Flights", flights });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving flights from MongoDB");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
