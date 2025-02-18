const express = require("express");
const router = express.Router();
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const userService = require("../services/userService");
const roleService = require("../services/roleService");
const flightService = require("../services/flightService");
const airportSlotService = require("../services/airportSlotService");
const demandHistoryService = require("../services/demandHistoryService");
const pricingService = require("../services/pricingService");
const eventService = require("../services/eventService");
const roles = require("../constants/roles");
const cityToAirports = require("../config/cityToAirports");

router.use(verifyToken, authorizeRoles([roles.ADMIN]));

router.get("/", (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard", user: req.user });
});

async function isLastAdmin(userId) {
  const user = await userService.getUserById(userId);
  if (!user) return false;

  if (user.Role?.role_name !== "admin") return false;

  const adminCount = await userService.countAdmins();
  return adminCount === 1;
}

// ----------------- USERS -----------------

router.get("/users", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1);
    const limit = 50;
    const offset = (page - 1) * limit;

    const { rows: users, count } = await userService.getAllUsers({
      search,
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);

    // for convenience let’s also fetch how many total admins exist
    // so we can detect if a user is the only admin
    const adminCount = await userService.countAdmins();

    res.render("admin/users/index", {
      title: "Manage Users",
      users,
      currentPage: page,
      totalPages,
      search,
      currentUserId: req.user.user_id,
      adminCount,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users/new", (req, res) => {
  res.render("admin/users/new", {
    title: "Create User",
    error: null,
    user: req.user,
  });
});

router.post("/users", async (req, res) => {
  try {
    const { username, password, email, role_id } = req.body;
    await userService.createUser({ username, password, email, role_id });
    res.redirect("/admin/users");
  } catch (err) {
    res.render("admin/users/new", {
      title: "Create User",
      error: err.message,
      user: req.user,
    });
  }
});

router.get("/users/:id/edit", async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).send("User not found.");
    res.render("admin/users/edit", {
      title: "Edit User",
      user,
      error: null,
      auth_user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { username, password, email, role_id } = req.body;

    const existingUser = await userService.getUserById(req.params.id);
    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    // check if this user is the last admin
    const existingRoleName = existingUser.Role?.role_name;
    if (
      existingRoleName === "admin" &&
      parseInt(role_id, 10) !== existingUser.role_id
    ) {
      const lastAdmin = await isLastAdmin(req.params.id);
      if (lastAdmin) {
        return res.status(400).send("Cannot demote the only remaining admin.");
      }
    }

    const user = await userService.updateUser(req.params.id, {
      username,
      password,
      email,
      role_id,
    });
    if (!user) return res.status(404).send("User not found.");
    res.redirect("/admin/users");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/users/:id/delete", async (req, res) => {
  try {
    // don't delete yourself
    if (parseInt(req.params.id, 10) === req.user.user_id) {
      return res.status(400).send("Cannot delete yourself.");
    }

    const lastAdmin = await isLastAdmin(req.params.id);
    if (lastAdmin) {
      return res.status(400).send("Cannot delete the last remaining admin.");
    }

    const success = await userService.deleteUser(req.params.id);
    if (!success) return res.status(404).send("User not found.");
    res.redirect("/admin/users");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ----------------- ROLES -----------------

router.get("/roles", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1);
    const limit = 50;
    const offset = (page - 1) * limit;
    const { rows: roles, count } = await roleService.getAllRoles({
      search,
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.render("admin/roles/index", {
      title: "Manage Roles",
      roles,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/roles/new", (req, res) => {
  res.render("admin/roles/new", {
    title: "Create Role",
    error: null,
    user: req.user,
  });
});

router.post("/roles", async (req, res) => {
  try {
    const { role_name } = req.body;
    await roleService.createRole(role_name);
    res.redirect("/admin/roles");
  } catch (err) {
    res.render("admin/roles/new", { title: "Create Role", error: err.message });
  }
});

router.get("/roles/:id/edit", async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) return res.status(404).send("Role not found.");
    res.render("admin/roles/edit", {
      title: "Edit Role",
      role,
      error: null,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/roles/:id", async (req, res) => {
  try {
    const { role_name } = req.body;
    const role = await roleService.updateRole(req.params.id, role_name);
    if (!role) return res.status(404).send("Role not found.");
    res.redirect("/admin/roles");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/roles/:id/delete", async (req, res) => {
  try {
    const success = await roleService.deleteRole(req.params.id);
    if (!success) return res.status(404).send("Role not found.");
    res.redirect("/admin/roles");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ----------------- FLIGHTS -----------------

router.get("/flights", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1);
    const limit = 50;
    const offset = (page - 1) * limit;
    const allFlights = await flightService.getAllFlights();
    let flightsFiltered = allFlights;
    if (search) {
      flightsFiltered = flightsFiltered.filter(
        (f) =>
          f.flight_number?.includes(search) ||
          f.origin_airport_code?.includes(search) ||
          f.destination_airport_code?.includes(search)
      );
    }
    const count = flightsFiltered.length;
    const flights = flightsFiltered.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);
    res.render("admin/flights/index", {
      title: "Manage Flights",
      flights,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/flights/new", (req, res) => {
  const {
    origin_airport_code,
    destination_airport_code,
    scheduled_departure,
    scheduled_arrival,
    direct_indirect_flag,
    return_option_flag,
  } = req.query;

  res.render("admin/flights/new", {
    title: "Create Flight",
    error: null,
    user: req.user,
    suggested: {
      origin_airport_code: origin_airport_code || "",
      destination_airport_code: destination_airport_code || "",
      scheduled_departure: scheduled_departure || "",
      scheduled_arrival: scheduled_arrival || "",
      direct_indirect_flag: direct_indirect_flag || "direct",
      return_option_flag: return_option_flag || "false",
    },
    cityToAirports,
  });
});

router.post("/flights/new", async (req, res, next) => {
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
    res.redirect("/admin/flights");
  } catch (err) {
    res.render("admin/flights/new", {
      title: "Create Flight",
      error: err.message,
    });
  }
});

router.get("/flights/:id/edit", async (req, res, next) => {
  try {
    const flight = await flightService.getFlightByUUID(req.params.id);
    if (!flight) return res.status(404).send("Flight not found.");
    res.render("admin/flights/edit", {
      title: "Edit Flight",
      flight,
      error: null,
      user: req.user,
      cityToAirports,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/flights/:id", async (req, res, next) => {
  try {
    const updated = await flightService.updateFlight(req.params.id, req.body);
    if (!updated) return res.status(404).send("Flight update failed.");
    res.redirect("/admin/flights");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/flights/:id/delete", async (req, res, next) => {
  try {
    const success = await flightService.deleteFlight(req.params.id);
    if (!success) return res.status(404).send("Flight could not be deleted.");
    res.redirect("/admin/flights");
  } catch (err) {
    next(err);
  }
});

// ----------------- AIRPORT SLOTS -----------------

router.get("/airport-slots", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1);
    const limit = 50;
    const offset = (page - 1) * limit;
    let allSlots = await airportSlotService.getAllSlots();
    if (search) {
      allSlots = allSlots.filter(
        (slot) =>
          slot.airport_code.includes(search) || slot.date.includes(search)
      );
    }
    const count = allSlots.length;
    const slots = allSlots.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);
    res.render("admin/airportSlots/index", {
      title: "Manage Airport Slots",
      slots,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/airport-slots/new", (req, res) => {
  res.render("admin/airportSlots/new", {
    title: "Create Airport Slot",
    error: null,
    user: req.user,
    cityToAirports,
  });
});

router.post("/airport-slots/new", async (req, res, next) => {
  try {
    const {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity,
    } = req.body;
    await airportSlotService.createSlot({
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity: parseInt(slot_capacity, 10),
    });
    res.redirect("/admin/airport-slots");
  } catch (err) {
    res.render("admin/airportSlots/new", {
      title: "Create Airport Slot",
      error: err.message,
    });
  }
});

router.get("/airport-slots/:id/edit", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const slot = await airportSlotService.getSlotById(slotId);
    if (!slot) return res.status(404).send("Airport Slot not found.");
    res.render("admin/airportSlots/edit", {
      title: "Edit Airport Slot",
      slot,
      error: null,
      user: req.user,
      cityToAirports,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/airport-slots/:id", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity,
    } = req.body;
    const updated = await airportSlotService.updateSlot(slotId, {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity: parseInt(slot_capacity, 10),
    });
    if (!updated) return res.status(404).send("Airport Slot update failed.");
    res.redirect("/admin/airport-slots");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/airport-slots/:id/delete", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const success = await airportSlotService.deleteSlot(slotId);
    if (!success)
      return res.status(404).send("Airport Slot could not be deleted.");
    res.redirect("/admin/airport-slots");
  } catch (err) {
    next(err);
  }
});

// ----------------- DEMAND HISTORY -----------------
router.get("/demand-history", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1, 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    let allDemandHistory = await demandHistoryService.getAllDemandHistory();

    if (search) {
      allDemandHistory = allDemandHistory.filter((record) =>
        record.flight_id.includes(search)
      );
    }

    const count = allDemandHistory.length;
    const demandHistory = allDemandHistory.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);

    res.render("admin/demandHistory/index", {
      title: "Manage Demand History",
      demandHistory,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/demand-history/new", async (req, res) => {
  let flights = await flightService.getAllFlights();

  res.render("admin/demandHistory/new", {
    title: "Create Demand History",
    error: null,
    user: req.user,
    cityToAirports,
    flights,
  });
});

router.post("/demand-history", async (req, res, next) => {
  try {
    await demandHistoryService.createDemandHistory(req.body);
    res.redirect("/admin/demand-history");
  } catch (err) {
    res.render("admin/demandHistory/new", {
      title: "Create Demand History",
      error: err.message,
      user: req.user,
    });
  }
});

router.get("/demand-history/:id/edit", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    let flights = await flightService.getAllFlights();
    const dh = await demandHistoryService.getDemandHistoryById(recordId);
    if (!dh) return res.status(404).send("Demand history record not found.");
    res.render("admin/demandHistory/edit", {
      title: "Edit Demand History",
      dh,
      error: null,
      user: req.user,
      cityToAirports,
      flights,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/demand-history/:id", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const updated = await demandHistoryService.updateDemandHistory(
      recordId,
      req.body
    );
    if (!updated)
      return res.status(404).send("Update failed; record not found.");
    res.redirect("/admin/demand-history");
  } catch (err) {
    res.render("admin/demand-history/edit", {
      title: "Edit Demand History",
      dh: { ...req.body, record_id: req.params.id },
      error: err.message,
      user: req.user,
    });
  }
});

router.post("/demand-history/:id/delete", async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id, 10);
    const deleted = await demandHistoryService.deleteDemandHistory(recordId);
    if (!deleted)
      return res.status(404).send("Could not delete record; not found.");
    res.redirect("/admin/demand-history");
  } catch (err) {
    next(err);
  }
});

// ----------------- PRICING -----------------

router.get("/pricing", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1, 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    let allPricing = await pricingService.getAllPricing();

    if (search) {
      allPricing = allPricing.filter((record) =>
        record.flight_id.includes(search)
      );
    }

    const count = allPricing.length;
    const pricingRecords = allPricing.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);

    res.render("admin/pricing/index", {
      title: "Manage Pricing",
      pricingRecords,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/pricing/new", async (req, res) => {
  let flights = await flightService.getAllFlights();
  res.render("admin/pricing/new", {
    title: "Create Pricing Record",
    error: null,
    user: req.user,
    cityToAirports,
    flights,
  });
});

router.post("/pricing", async (req, res) => {
  try {
    const {
      flight_id,
      effective_date_range_start,
      effective_date_range_end,
      base_price,
      discounts_offered,
      peak_season_surcharge,
    } = req.body;

    await pricingService.createPricing({
      flight_id,
      effective_date_range_start,
      effective_date_range_end,
      base_price,
      discounts_offered,
      peak_season_surcharge,
    });

    res.redirect("/admin/pricing");
  } catch (err) {
    res.render("admin/pricing/new", {
      title: "Create Pricing Record",
      error: err.message,
      user: req.user,
    });
  }
});

router.get("/pricing/:id/edit", async (req, res, next) => {
  try {
    const pricingId = parseInt(req.params.id, 10);
    const pricingRecord = await pricingService.getPricingById(pricingId);
    let flights = await flightService.getAllFlights();

    if (!pricingRecord)
      return res.status(404).send("Pricing record not found.");

    res.render("admin/pricing/edit", {
      title: "Edit Pricing Record",
      pricingRecord,
      error: null,
      user: req.user,
      cityToAirports,
      flights,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/pricing/:id", async (req, res) => {
  try {
    const pricingId = parseInt(req.params.id, 10);

    const {
      flight_id,
      effective_date_range_start,
      effective_date_range_end,
      base_price,
      discounts_offered,
      peak_season_surcharge,
    } = req.body;

    const updated = await pricingService.updatePricing(pricingId, {
      flight_id,
      effective_date_range_start,
      effective_date_range_end,
      base_price,
      discounts_offered,
      peak_season_surcharge,
    });

    if (!updated) return res.status(404).send("Pricing update failed.");

    res.redirect("/admin/pricing");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/pricing/:id/delete", async (req, res) => {
  try {
    const pricingId = parseInt(req.params.id, 10);
    const deleted = await pricingService.deletePricing(pricingId);

    if (!deleted) return res.status(404).send("Pricing record not found.");

    res.redirect("/admin/pricing");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ----------------- EVENTS -----------------

router.get("/events", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1, 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    const { rows: events, count } = await eventService.getAllEventsBy({
      search,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("admin/events/index", {
      title: "Manage Events",
      events,
      currentPage: page,
      totalPages,
      search,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/events/new", (req, res) => {
  res.render("admin/events/new", {
    title: "Create Event",
    error: null,
    user: req.user,
  });
});

router.post("/events/new", async (req, res) => {
  try {
    const {
      event_id,
      event_name,
      location_city,
      start_date,
      end_date,
      expected_additional_traffic_factor,
    } = req.body;

    await eventService.createEvent({
      event_id,
      event_name,
      location_city,
      start_date,
      end_date,
      expected_additional_traffic_factor,
    });

    res.redirect("/admin/events");
  } catch (err) {
    res.render("admin/events/new", {
      title: "Create Event",
      error: err.message,
      user: req.user,
    });
  }
});

router.get("/events/:id/edit", async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await eventService.getEventById(eventId);

    if (!event) return res.status(404).send("Event not found.");

    res.render("admin/events/edit", {
      title: "Edit Event",
      event,
      error: null,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      event_name,
      location_city,
      start_date,
      end_date,
      expected_additional_traffic_factor,
    } = req.body;

    const updated = await eventService.updateEvent(eventId, {
      event_name,
      location_city,
      start_date,
      end_date,
      expected_additional_traffic_factor,
    });

    if (!updated) {
      return res.status(404).send("Event update failed; event not found.");
    }

    res.redirect("/admin/events");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/events/:id/delete", async (req, res) => {
  try {
    const eventId = req.params.id;
    const success = await eventService.deleteEvent(eventId);

    if (!success) {
      return res.status(404).send("Event could not be deleted; not found.");
    }

    res.redirect("/admin/events");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
