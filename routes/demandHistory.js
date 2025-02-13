const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const roles = require("../constants/roles");

const {
  getAllDemandHistory,
  getDemandHistoryById,
  createDemandHistory,
  updateDemandHistory,
  deleteDemandHistory,
} = require("../services/demandHistoryService");

const cityToAirports = require("../config/cityToAirports");
const flightService = require("../services/flightService");

router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.MANAGER, roles.ANALYST])
);

router.get("/", async (req, res, next) => {
  try {
    const demandHistory = await getAllDemandHistory();
    res.render("demandHistory/index", { demandHistory, user: req.user });
  } catch (err) {
    next(err);
  }
});

router.get("/new", async (req, res) => {
  const flights = await flightService.getAllFlights();

  res.render("demandHistory/new", {
    error: null,
    user: req.user,
    cityToAirports,
    flights,
  });
});

router.post("/", async (req, res, next) => {
  try {
    await createDemandHistory(req.body);
    res.redirect("/demand-history");
  } catch (err) {
    res.render("demandHistory/new", { error: err.message, user: req.user });
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const dh = await getDemandHistoryById(recordId);
    const flights = await flightService.getAllFlights();
    const selectedFlight = flightService.getFlightByUUID(dh.flight_id);
    if (!dh) return res.status(404).send("Demand history record not found.");
    res.render("demandHistory/edit", {
      dh,
      error: null,
      user: req.user,
      cityToAirports,
      flights,
      selectedFlight,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const updated = await updateDemandHistory(recordId, req.body);
    if (!updated)
      return res.status(404).send("Update failed; record not found.");
    res.redirect("/demand-history");
  } catch (err) {
    res.render("demandHistory/edit", {
      dh: { ...req.body, record_id: req.params.id },
      error: err.message,
      user: req.user,
    });
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const deleted = await deleteDemandHistory(recordId);
    if (!deleted)
      return res.status(404).send("Could not delete record; not found.");
    res.redirect("/demand-history");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
