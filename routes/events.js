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

router.get("/", async (_, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.render("events/index", { title: "All Events", events });
  } catch (error) {
    next(error);
  }
});

router.get("/new", (_, res) => {
  res.render("events/new", {
    title: "Create New Event",
    eventData: {},
    error: null,
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
