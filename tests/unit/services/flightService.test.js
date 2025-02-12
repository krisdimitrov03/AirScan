const { Op } = require("sequelize");
const flightService = require("../../../services/flightService");
const Flight = require("../../../models/Flight");
jest.mock("../../../models/Flight");

describe("flightService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllFlights", () => {
    it("returns all flights", async () => {
      const flights = [{ flight_id: "f1" }, { flight_id: "f2" }];
      Flight.findAll.mockResolvedValue(flights);
      const result = await flightService.getAllFlights();
      expect(Flight.findAll).toHaveBeenCalled();
      expect(result).toEqual(flights);
    });
  });

  describe("getFlightByUUID", () => {
    it("returns flight by uuid", async () => {
      const flight = { flight_id: "f1" };
      Flight.findByPk.mockResolvedValue(flight);
      const result = await flightService.getFlightByUUID("f1");
      expect(Flight.findByPk).toHaveBeenCalledWith("f1");
      expect(result).toEqual(flight);
    });
  });

  describe("createFlight", () => {
    const flightData = {
      origin_airport_code: "LAX",
      destination_airport_code: "JFK",
      scheduled_departure: "2025-12-01T10:00:00.000Z",
      scheduled_arrival: "2025-12-01T16:00:00.000Z",
    };
    it("creates a flight if no overlapping flight exists", async () => {
      Flight.findOne.mockResolvedValue(null);
      const createdFlight = { flight_id: "f1", ...flightData };
      Flight.create.mockResolvedValue(createdFlight);
      const result = await flightService.createFlight(flightData);
      expect(Flight.findOne).toHaveBeenCalled();
      expect(Flight.create).toHaveBeenCalledWith(flightData);
      expect(result).toEqual(createdFlight);
    });
    it("throws error if overlapping flight exists", async () => {
      Flight.findOne.mockResolvedValue({ flight_id: "overlap" });
      await expect(flightService.createFlight(flightData)).rejects.toThrow(
        "A concurrent flight with the same flight number already exists."
      );
    });
  });

  describe("updateFlight", () => {
    const existingFlight = {
      flight_id: "f1",
      origin_airport_code: "LAX",
      destination_airport_code: "JFK",
      scheduled_departure: "2025-12-01T10:00:00.000Z",
      scheduled_arrival: "2025-12-01T16:00:00.000Z",
      update: jest.fn(),
    };
    it("returns null if flight not found", async () => {
      Flight.findByPk.mockResolvedValue(null);
      const result = await flightService.updateFlight("nonexistent", {});
      expect(result).toBeNull();
    });
    it("updates flight if no overlapping flight exists", async () => {
      Flight.findByPk.mockResolvedValue(existingFlight);
      Flight.findOne.mockResolvedValue(null);
      const updateData = {
        scheduled_departure: "2025-12-01T11:00:00.000Z",
        scheduled_arrival: "2025-12-01T17:00:00.000Z",
      };
      const updatedFlight = { ...existingFlight, ...updateData };
      existingFlight.update.mockResolvedValue(updatedFlight);
      const result = await flightService.updateFlight("f1", updateData);
      expect(Flight.findByPk).toHaveBeenCalledWith("f1");
      expect(Flight.findOne).toHaveBeenCalled();
      expect(existingFlight.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(updatedFlight);
    });
    it("throws error if overlapping flight exists during update", async () => {
      Flight.findByPk.mockResolvedValue(existingFlight);
      Flight.findOne.mockResolvedValue({ flight_id: "overlap" });
      const updateData = {
        scheduled_departure: "2025-12-01T11:00:00.000Z",
        scheduled_arrival: "2025-12-01T17:00:00.000Z",
      };
      await expect(
        flightService.updateFlight("f1", updateData)
      ).rejects.toThrow(
        "A concurrent flight with the same flight number already exists."
      );
    });
  });

  describe("deleteFlight", () => {
    it("returns true if deletion is successful", async () => {
      Flight.destroy.mockResolvedValue(1);
      const result = await flightService.deleteFlight("f1");
      expect(Flight.destroy).toHaveBeenCalledWith({
        where: { flight_id: "f1" },
      });
      expect(result).toBe(true);
    });
    it("returns false if deletion fails", async () => {
      Flight.destroy.mockResolvedValue(0);
      const result = await flightService.deleteFlight("f1");
      expect(result).toBe(false);
    });
  });
});
