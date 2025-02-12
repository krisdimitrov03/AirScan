// routes/forecast.js
const router = require("express").Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const { forecastFlight } = require("../services/forecastService");
const roles = require("../constants/roles");

router.use(verifyToken, authorizeRoles([
  roles.ADMIN,
  roles.MANAGER,
  roles.ANALYST
]));

// GET /forecast/:flightId
router.get("/:flightId", async (req, res, next) => {
  try {
    const { flightId } = req.params;
    const forecastedProfit = await forecastFlight(flightId);
    res.json({
      flightId,
      forecastedProfit: forecastedProfit.toFixed(2),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
