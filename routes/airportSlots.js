const express = require("express");
const router = express.Router();
const airportSlotService = require("../services/airportSlotService");
const {
  validateAirportSlotCapacityIsPositive,
  hasConflictOrOverlappingAirportSlots,
} = require("../services/validator");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const roles = require("../constants/roles");

router.use(
  verifyToken,
  authorizeRoles([roles.ANALYST, roles.ADMIN, roles.MANAGER])
);

router.get("/", async (_, res, next) => {
  try {
    const airportSlots = await airportSlotService.getAllSlots();
    res.render("airportSlots/index", { airportSlots });
  } catch (error) {
    next(error);
  }
});

router.get("/new", (req, res) => {
  res.render("airportSlots/new");
});

router.post("/", async (req, res, next) => {
  try {
    const {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity,
    } = req.body;

    const capacity = parseInt(slot_capacity, 10);
    if (!validateAirportSlotCapacityIsPositive(capacity)) {
      return res.status(400).send("Slot capacity must be a positive integer.");
    }

    const allSlots = await airportSlotService.getAllSlots();
    if (
      hasConflictOrOverlappingAirportSlots(
        allSlots,
        airport_code,
        date,
        time_slot_start,
        time_slot_end
      )
    ) {
      return res
        .status(409)
        .send("This time slot conflicts with an existing slot.");
    }

    await airportSlotService.createSlot({
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity: capacity,
    });

    res.redirect("/airport-slots");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .send(
          "A slot with this (airport_code, date, time_slot_start) already exists."
        );
    }
    next(error);
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const airportSlot = await airportSlotService.getSlotById(slotId);

    if (!airportSlot) {
      return res.status(404).send("Slot not found.");
    }

    res.render("airportSlots/edit", { airportSlot });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity,
    } = req.body;

    const capacity = parseInt(slot_capacity, 10);
    if (!validateAirportSlotCapacityIsPositive(capacity)) {
      return res.status(400).send("Slot capacity must be a positive integer.");
    }

    const updated = await airportSlotService.updateSlot(slotId, {
      airport_code,
      date,
      time_slot_start,
      time_slot_end,
      slot_capacity: capacity,
    });

    if (!updated) {
      return res.status(404).send("Slot not found or update failed.");
    }

    res.redirect("/airport-slots");
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .send(
          "A slot with this (airport_code, date, time_slot_start) already exists."
        );
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const slotId = parseInt(req.params.id, 10);
    const result = await airportSlotService.deleteSlot(slotId);

    if (!result) {
      return res.status(404).send("Slot not found or could not be deleted.");
    }

    res.redirect("/airport-slots");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
