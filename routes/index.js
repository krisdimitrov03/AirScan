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
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, (req, res) => {
  res.redirect("/dashboard");
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

module.exports = router;
