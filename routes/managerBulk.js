const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const roles = require("../constants/roles");

const roleService = require("../services/roleService");
const userService = require("../services/userService");
const airportSlotService = require("../services/airportSlotService");
const eventService = require("../services/eventService");
const flightService = require("../services/flightService");
const demandHistoryService = require("../services/demandHistoryService");
const pricingService = require("../services/pricingService");

const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.use(verifyToken, authorizeRoles([roles.MANAGER]));

router.get("/", (req, res) => {
  res.render("manager/bulk", { message: null, error: null, user: req.user });
});

// ----------------- Roles -----------------
router.get("/roles", (req, res) => {
  res.render("manager/roles/bulk", { message: null, error: null, user: req.user });
});

router.post("/roles", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/roles";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let rolesData;
    try {
      rolesData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/roles";</script>`);
    }
    if (!Array.isArray(rolesData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/roles";</script>`);
    }
    await roleService.bulkCreateRoles(rolesData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Roles imported successfully"); window.location.href="/manager/bulk/roles";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Users -----------------
router.get("/users", (req, res) => {
  res.render("manager/users/bulk", { message: null, error: null, user: req.user });
});

router.post("/users", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/users";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let usersData;
    try {
      usersData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/users";</script>`);
    }
    if (!Array.isArray(usersData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/users";</script>`);
    }
    await userService.bulkCreateUsers(usersData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Users imported successfully"); window.location.href="/manager/bulk/users";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Airport Slots -----------------
router.get("/airport-slots", (req, res) => {
  res.render("manager/airportSlots/bulk", { message: null, error: null, user: req.user });
});

router.post("/airport-slots", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/airport-slots";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let slotsData;
    try {
      slotsData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/airport-slots";</script>`);
    }
    if (!Array.isArray(slotsData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/airport-slots";</script>`);
    }
    await airportSlotService.bulkCreateAirportSlots(slotsData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Airport slots imported successfully"); window.location.href="/manager/bulk/airport-slots";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Events -----------------
router.get("/events", (req, res) => {
  res.render("manager/events/bulk", { message: null, error: null, user: req.user });
});

router.post("/events", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/events";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let eventsData;
    try {
      eventsData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/events";</script>`);
    }
    if (!Array.isArray(eventsData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/events";</script>`);
    }
    await eventService.bulkCreateEvents(eventsData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Events imported successfully"); window.location.href="/manager/bulk/events";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Flights -----------------
router.get("/flights", (req, res) => {
  res.render("manager/flights/bulk", { message: null, error: null, user: req.user });
});

router.post("/flights", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/flights";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let flightsData;
    try {
      flightsData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/flights";</script>`);
    }
    if (!Array.isArray(flightsData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/flights";</script>`);
    }
    await flightService.bulkCreateFlights(flightsData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Flights imported successfully"); window.location.href="/manager/bulk/flights";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Demand History -----------------
router.get("/demand-history", (req, res) => {
  res.render("manager/demandHistory/bulk", { message: null, error: null, user: req.user });
});

router.post("/demand-history", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/demand-history";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let demandData;
    try {
      demandData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/demand-history";</script>`);
    }
    if (!Array.isArray(demandData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/demand-history";</script>`);
    }
    await demandHistoryService.bulkCreateDemandHistory(demandData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Demand history imported successfully"); window.location.href="/manager/bulk/demand-history";</script>`);
  } catch (error) {
    next(error);
  }
});

// ----------------- Pricing -----------------
router.get("/pricing", (req, res) => {
  res.render("manager/pricing/bulk", { message: null, error: null, user: req.user });
});

router.post("/pricing", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.send(`<script>alert("File not provided."); window.location.href="/manager/bulk/pricing";</script>`);
    }
    const fileData = fs.readFileSync(req.file.path, "utf8");
    let pricingData;
    try {
      pricingData = JSON.parse(fileData);
    } catch (e) {
      return res.send(`<script>alert("Invalid JSON file."); window.location.href="/manager/bulk/pricing";</script>`);
    }
    if (!Array.isArray(pricingData)) {
      return res.send(`<script>alert("Data must be an array."); window.location.href="/manager/bulk/pricing";</script>`);
    }
    await pricingService.bulkCreatePricing(pricingData);
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    res.send(`<script>alert("Pricing records imported successfully"); window.location.href="/manager/bulk/pricing";</script>`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
