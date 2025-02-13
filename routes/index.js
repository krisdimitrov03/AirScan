const router = require("express").Router();

const authRouter = require("./auth");
const airportSlotsRouter = require("./airportSlots");
const dashboardRouter = require("./dashboard");
const profileRouter = require("./profile");
const flightRouter = require("./flights");
const adminRouter = require("./admin");
const pricingRouter = require("./pricing");
const demandHistoryRouter = require("./demandHistory");
const eventRouter = require("./events");
const managerRouter = require("./manager");

const forecastRouter = require("./forecast");
const planningRouter = require("./planning");
const { verifyToken } = require("../middlewares/authMiddleware");
const { ADMIN, MANAGER, ANALYST } = require("../constants/roles");

router.get("/", verifyToken, (req, res) => {
  let path = "";

  switch (req.user.role_name) {
    case ADMIN:
      path = "/admin";
      break;
    case MANAGER:
      path = "/manager";
      break;
    case ANALYST:
      path = "/dashboard";
      break;
  }

  return res.redirect(path);
});

router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/profile", profileRouter);
router.use("/airport-slots", airportSlotsRouter);
router.use("/flights", flightRouter);
router.use("/admin", adminRouter);
router.use("/pricing", pricingRouter);
router.use("/demand-history", demandHistoryRouter);
router.use("/events", eventRouter);
router.use("/manager", managerRouter);
router.use("/forecast", forecastRouter);
router.use("/planning", planningRouter);

module.exports = router;
