// routes/managerBulk.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const roles = require("../constants/roles");

const airportSlotService = require("../services/airportSlotService");
const eventService = require("../services/eventService");
const flightService = require("../services/flightService");
const demandHistoryService = require("../services/demandHistoryService");
const pricingService = require("../services/pricingService");
const { forecastFlight } = require("../services/forecastService");

router.use(verifyToken, authorizeRoles([roles.MANAGER]));


router.get("/", async (req, res) => {
  let message = null;
  let error = null;
  let user = req.user;
  try {
    const currentYear = new Date().getFullYear();
    // Retrieve all flights.
    const flights = await flightService.getAllFlights();
    // Filter to flights whose scheduled_departure is in the current year.
    const flightsThisYear = flights.filter(fl => {
      const depYear = new Date(fl.scheduled_departure).getFullYear();
      return depYear === currentYear;
    });

    // Create an array with 12 zeros (one for each month: index 0 = January, etc).
    const monthlyForecast = new Array(12).fill(0);
    // For each flight, compute its forecasted profit and add to the proper month.
    for (const fl of flightsThisYear) {
      try {
        const profit = await forecastFlight(fl.flight_id, 60);
        const depDate = new Date(fl.scheduled_departure);
        const month = depDate.getMonth(); // 0-based month index
        monthlyForecast[month] += profit;
      } catch (fcErr) {
        console.error("Forecast error for flight", fl.flight_id, fcErr.message);
      }
    }

    // Prepare month labels.
    const monthLabels = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    res.render("manager/bulk", {
      message,
      error,
      user,
      monthlyForecast,
      monthLabels
    });
  } catch (err) {
    error = err.message || "Error fetching flights";
    return res.render("manager/bulk", {
      message: null,
      error,
      user,
      monthlyForecast: [],
      monthLabels: []
    });
  }
});

/** The existing “bulk” routes (unchanged) */

// Bulk: Airport Slots
router.get("/bulk/airport-slots", (req, res) => {
  res.render("manager/airportSlots/bulk", {
    message: null,
    error: null,
    user: req.user,
  });
});

router.post(
  "/bulk/airport-slots",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.send(
          `<script>alert("File not provided."); window.location.href="/manager/bulk/airport-slots";</script>`
        );
      }
      const fileData = fs.readFileSync(req.file.path, "utf8");
      let slotsData;
      try {
        slotsData = JSON.parse(fileData);
      } catch (e) {
        return res.send(
          `<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/airport-slots";</script>`
        );
      }
      if (!Array.isArray(slotsData)) {
        return res.send(
          `<script>alert("Data must be an array."); window.location.href="/manager/bulk/airport-slots";</script>`
        );
      }
      await airportSlotService.bulkCreateAirportSlots(slotsData);
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
      res.send(
        `<script>alert("Airport slots imported successfully"); window.location.href="/manager/bulk/airport-slots";</script>`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Bulk: Events
router.get("/bulk/events", (req, res) => {
  res.render("manager/events/bulk", {
    message: null,
    error: null,
    user: req.user,
  });
});

router.post("/bulk/events", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(
        `<script>alert("File not provided."); window.location.href="/manager/bulk/events";</script>`
      );
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let eventsData;
    try {
      eventsData = JSON.parse(fileData);
    } catch (e) {
      return res.send(
        `<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/events";</script>`
      );
    }
    if (!Array.isArray(eventsData)) {
      return res.send(
        `<script>alert("Data must be an array."); window.location.href="/manager/bulk/events";</script>`
      );
    }
    await eventService.bulkCreateEvents(eventsData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(
      `<script>alert("Events imported successfully"); window.location.href="/manager/bulk/events";</script>`
    );
  } catch (error) {
    next(error);
  }
});

// Bulk: Flights
router.get("/bulk/flights", (req, res) => {
  res.render("manager/flights/bulk", {
    message: null,
    error: null,
    user: req.user,
  });
});

router.post("/bulk/flights", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(
        `<script>alert("File not provided."); window.location.href="/manager/bulk/flights";</script>`
      );
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let flightsData;
    try {
      flightsData = JSON.parse(fileData);
    } catch (e) {
      return res.send(
        `<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/flights";</script>`
      );
    }
    if (!Array.isArray(flightsData)) {
      return res.send(
        `<script>alert("Data must be an array."); window.location.href="/manager/bulk/flights";</script>`
      );
    }
    await flightService.bulkCreateFlights(flightsData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(
      `<script>alert("Flights imported successfully"); window.location.href="/manager/bulk/flights";</script>`
    );
  } catch (error) {
    next(error);
  }
});

// Bulk: Demand History
router.get("/bulk/demand-history", (req, res) => {
  res.render("manager/demandHistory/bulk", {
    message: null,
    error: null,
    user: req.user,
  });
});

router.post(
  "/bulk/demand-history",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.send(
          `<script>alert("File not provided."); window.location.href="/manager/bulk/demand-history";</script>`
        );
      }
      const fileData = fs.readFileSync(req.file.path, "utf8");
      let demandData;
      try {
        demandData = JSON.parse(fileData);
      } catch (e) {
        return res.send(
          `<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/demand-history";</script>`
        );
      }
      if (!Array.isArray(demandData)) {
        return res.send(
          `<script>alert("Data must be an array."); window.location.href="/manager/bulk/demand-history";</script>`
        );
      }
      await demandHistoryService.bulkCreateDemandHistory(demandData);
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
      res.send(
        `<script>alert("Demand history imported successfully"); window.location.href="/manager/bulk/demand-history";</script>`
      );
    } catch (error) {
      next(error);
    }
  }
);

// Bulk: Pricing
router.get("/bulk/pricing", (req, res) => {
  res.render("manager/pricing/bulk", {
    message: null,
    error: null,
    user: req.user,
  });
});

router.post("/bulk/pricing", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(
        `<script>alert("File not provided."); window.location.href="/manager/bulk/pricing";</script>`
      );
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let pricingData;
    try {
      pricingData = JSON.parse(fileData);
    } catch (e) {
      return res.send(
        `<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/pricing";</script>`
      );
    }
    if (!Array.isArray(pricingData)) {
      return res.send(
        `<script>alert("Data must be an array."); window.location.href="/manager/bulk/pricing";</script>`
      );
    }
    await pricingService.bulkCreatePricing(pricingData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(
      `<script>alert("Pricing records imported successfully"); window.location.href="/manager/bulk/pricing";</script>`
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
