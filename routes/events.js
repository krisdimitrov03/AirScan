const router = require("express").Router();
const eventService = require("../services/eventService");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const roles = require("../constants/roles");

router.use(
  verifyToken,
  authorizeRoles([roles.ADMIN, roles.MANAGER, roles.ANALYST])
);

router.get("/", async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || 1, 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    let allEvents = await eventService.getAllEvents();
    if (search) {
      allEvents = allEvents.filter(
        (event) =>
          event.event_id?.includes(search) ||
          event.event_name?.includes(search) ||
          event.location_city?.includes(search)
      );
    }

    const count = allEvents.length;
    const paginatedEvents = allEvents.slice(offset, offset + limit);
    const totalPages = Math.ceil(count / limit);

    res.render("events/index", {
      title: "All Events",
      events: paginatedEvents,
      user: req.user,
      search,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/new", (req, res) => {
  res.render("events/new", {
    title: "Create New Event",
    eventData: {},
    error: null,
    user: req.user,
  });
});

router.post("/", async (req, res, next) => {
  try {
    await eventService.createEvent(req.body);
    res.redirect(`/events`);
  } catch (error) {
    res.render("events/new", {
      title: "Create New Event",
      eventData: req.body,
      error: error.message || "Error creating event",
      user: req.user,
    });
  }
});

router.get("/:eventId/edit", async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.render("events/edit", {
      title: "Edit Event",
      eventData: event,
      error: null,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:eventId", async (req, res, next) => {
  try {
    const updatedEvent = await eventService.updateEvent(
      req.params.eventId,
      req.body
    );
    if (!updatedEvent) {
      return res.status(404).send("Event not found for update");
    }
    res.redirect("/events");
  } catch (error) {
    res.render("events/edit", {
      title: "Edit Event",
      eventData: { ...req.body, event_id: req.params.eventId },
      error: error.message || "Error updating event",
      user: req.user,
    });
  }
});

router.delete("/:eventId", async (req, res, next) => {
  try {
    const deletedRows = await eventService.deleteEvent(req.params.eventId);
    if (!deletedRows) {
      return res.status(404).send("Event not found for deletion");
    }
    res.redirect("/events");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
