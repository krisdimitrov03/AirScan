const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const flightService = require("../services/flightService");
const cityToAirports = require("../config/cityToAirports");

const roles = require("../constants/roles");

router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.ANALYST, roles.MANAGER])
);

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const flights = await flightService.getAllFlights();
    res.render("flights/index", { flights, user: req.user });
  } catch (e) {
    next(e);
  }
});

router.get("/new", (req, res) => {
  const {
    origin_airport_code,
    destination_airport_code,
    scheduled_departure,
    scheduled_arrival,
    direct_indirect_flag,
    return_option_flag,
  } = req.query;

  res.render("flights/new", {
    title: "Create New Flight",
    error: null,
    suggested: {
      origin_airport_code: origin_airport_code || "",
      destination_airport_code: destination_airport_code || "",
      scheduled_departure: scheduled_departure || "",
      scheduled_arrival: scheduled_arrival || "",
      direct_indirect_flag: direct_indirect_flag || "direct",
      return_option_flag: return_option_flag || "false",
    },
    user: req.user,
    cityToAirports,
  });
});

router.post("/", async (req, res, next) => {
  try {
    const {
      origin_airport_code,
      destination_airport_code,
      direct_indirect_flag,
      return_option_flag,
      scheduled_departure,
      scheduled_arrival,
    } = req.body;
    await flightService.createFlight({
      origin_airport_code,
      destination_airport_code,
      direct_indirect_flag,
      return_option_flag: return_option_flag === "true",
      scheduled_departure,
      scheduled_arrival,
    });
    res.redirect("/flights");
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).send("Flight ID already exists.");
    }
    next(e);
  }
});

router.get("/:uuid/edit", async (req, res, next) => {
  try {
    const flight = await flightService.getFlightByUUID(req.params.uuid);
    if (!flight) return res.status(404).send("Flight not found.");
    res.render("flights/edit", { flight, user: req.user, cityToAirports });
  } catch (e) {
    next(e);
  }
});

router.put("/:uuid", async (req, res, next) => {
  try {
    const updated = await flightService.updateFlight(req.params.uuid, req.body);
    if (!updated) return res.status(404).send("Flight update failed.");
    res.redirect("/flights");
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).send("Flight ID already exists.");
    }
    next(e);
  }
});

router.delete("/:uuid", async (req, res, next) => {
  try {
    const result = await flightService.deleteFlight(req.params.uuid);
    if (!result) return res.status(404).send("Flight could not be deleted.");
    res.redirect("/flights");
  } catch (e) {
    next(e);
  }
});

module.exports = router;
