const router = require("express").Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const roles = require("../constants/roles");
const { suggestFlights } = require("../services/planningService");
router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.MANAGER, roles.ANALYST])
);
const { forecastNewFlight } = require("../services/ephemeralForecast");
router.get("/suggest", async (req, res, next) => {
  try {
    const suggestions = await suggestFlights();
    const suggestionsWithForecast = [];
    for (const s of suggestions) {
      const forecastedProfit = await forecastNewFlight({
        origin_airport: s.origin_airport,
        destination_airport: s.destination_airport,
        departure_time: s.departure_time,
      });
      suggestionsWithForecast.push({
        ...s,
        forecastedProfit: forecastedProfit.toFixed(2),
      });
    }
    res.render("planning/suggestions", {
      title: "AI Flight Suggestions",
      suggestions: suggestionsWithForecast,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
