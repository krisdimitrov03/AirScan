const router = require("express").Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const pricingService = require("../services/pricingService");
const flightService = require("../services/flightService");
const roles = require("../constants/roles");
const cityToAirports = require("../config/cityToAirports");

router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.MANAGER, roles.ANALYST])
);

router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1, 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    let allPricing = await pricingService.getAllPricing();

    if (search) {
      allPricing = allPricing.filter((record) =>
        record.flight_number?.includes(search)
      );
    }

    const count = allPricing.length;
    let paginatedPricing = allPricing.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);

    paginatedPricing = await Promise.all(
      paginatedPricing.map(async (record) => {
        const plainRecord = record.get({ plain: true });
        const { flight_number } = await flightService.getFlightByUUID(
          plainRecord.flight_id
        );
        return { ...plainRecord, flight_number };
      })
    );

    res.render("pricing/index", {
      pricings: paginatedPricing,
      user: req.user,
      search,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Error fetching pricing records.");
  }
});

router.get("/new", async (req, res) => {
  const flights = await flightService.getAllFlights();

  res.render("pricing/new", {
    error: null,
    flights,
    user: req.user,
    cityToAirports,
  });
});

router.post("/", async (req, res) => {
  try {
    await pricingService.createPricing(req.body);
    res.redirect("/pricing");
  } catch (error) {
    res.render("pricing/new", { error: error.message, user: req.user });
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const pricingId = req.params.id;
    const pricing = await pricingService.getPricingById(pricingId);
    const flights = await flightService.getAllFlights();
    const selectedFlight = await flightService.getFlightByUUID(
      pricing.flight_id
    );

    if (!pricing) {
      return res.status(404).send("Pricing record not found");
    }

    res.render("pricing/edit", {
      pricing,
      error: null,
      user: req.user,
      cityToAirports,
      selectedFlight,
      flights,
    });
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
      user: req.user,
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
