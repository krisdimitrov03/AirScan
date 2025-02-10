const router = require("express").Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const pricingService = require("../services/pricingService");
const flightService = require("../services/flightService");
const roles = require("../constants/roles");

router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.MANAGER, roles.ANALYST])
);

router.get("/", async (_, res) => {
  try {
    const pricings = await pricingService.getAllPricing();
    res.render("pricing/index", { pricings });
  } catch (error) {
    res.status(500).send("Error fetching pricing records.");
  }
});

router.get("/new", async (_, res) => {
  const flights = await flightService.getAllFlights();

  res.render("pricing/new", { error: null, flights });
});

router.post("/", async (req, res) => {
  try {
    await pricingService.createPricing(req.body);
    res.redirect("/pricing");
  } catch (error) {
    res.render("pricing/new", { error: error.message });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const pricingId = req.params.id;
    const pricing = await pricingService.getPricingById(pricingId);

    if (!pricing) {
      return res.status(404).send("Pricing record not found");
    }

    res.render("pricing/edit", { pricing, error: null });
  } catch (error) {
    res.status(500).send("Error fetching pricing record for edit.");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const pricingId = req.params.id;
    const updatedPricing = await pricingService.updatePricing(
      pricingId,
      req.body
    );

    if (!updatedPricing) {
      return res.status(404).send("Pricing record not found to update");
    }
    res.redirect("/pricing");
  } catch (error) {
    res.render("pricing/edit", {
      pricing: { ...req.body, pricing_id: req.params.id },
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pricingId = req.params.id;
    const deleted = await pricingService.deletePricing(pricingId);

    if (!deleted) {
      return res.status(404).send("Pricing record not found to delete");
    }
    res.redirect("/pricing");
  } catch (error) {
    res.status(500).send("Error deleting pricing record.");
  }
});

module.exports = router;
