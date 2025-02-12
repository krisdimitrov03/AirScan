const eventService = require("../../../services/eventService");
const { Event } = require("../../../models");
const validator = require("../../../services/validator");
jest.mock("../../../models", () => ({
  Event: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), destroy: jest.fn() },
}));
jest.mock("../../../services/validator", () => ({
  validateEventDateRange: jest.fn(),
  validateExpectedAdditionalTrafficFactor: jest.fn(),
}));

describe("eventService", () => {
  afterEach(() => { jest.clearAllMocks(); });
  
  describe("createEvent", () => {
    it("creates an event when data is valid", async () => {
      const eventData = {
        event_id: "evt1",
        event_name: "Test Event",
        location_city: "City",
        start_date: "2025-01-01",
        end_date: "2025-01-02",
        expected_additional_traffic_factor: 2,
      };
      const createdEvent = { ...eventData };
      Event.create.mockResolvedValue(createdEvent);
      const result = await eventService.createEvent(eventData);
      expect(validator.validateEventDateRange).toHaveBeenCalledWith("2025-01-01", "2025-01-02");
      expect(validator.validateExpectedAdditionalTrafficFactor).toHaveBeenCalledWith(2);
      expect(Event.create).toHaveBeenCalledWith(eventData);
      expect(result).toEqual(createdEvent);
    });
  });
  
  describe("getAllEvents", () => {
    it("returns all events", async () => {
      const events = [{ event_id: "evt1" }, { event_id: "evt2" }];
      Event.findAll.mockResolvedValue(events);
      const result = await eventService.getAllEvents();
      expect(Event.findAll).toHaveBeenCalled();
      expect(result).toEqual(events);
    });
  });
  
  describe("getEventById", () => {
    it("returns event by id", async () => {
      const event = { event_id: "evt1" };
      Event.findByPk.mockResolvedValue(event);
      const result = await eventService.getEventById("evt1");
      expect(Event.findByPk).toHaveBeenCalledWith("evt1");
      expect(result).toEqual(event);
    });
  });
  
  describe("updateEvent", () => {
    it("updates event when found", async () => {
      const updateData = {
        event_name: "Updated Event",
        start_date: "2025-02-01",
        end_date: "2025-02-02",
        expected_additional_traffic_factor: 3,
      };
      const mockEventInstance = { 
        event_id: "evt1",
        event_name: "Original Event",
        start_date: "2025-01-01",
        end_date: "2025-01-02",
        expected_additional_traffic_factor: 2,
        update: jest.fn().mockImplementation(function(data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };
      Event.findByPk.mockResolvedValue(mockEventInstance);
      const result = await eventService.updateEvent("evt1", updateData);
      expect(validator.validateEventDateRange).toHaveBeenCalledWith("2025-02-01", "2025-02-02");
      expect(validator.validateExpectedAdditionalTrafficFactor).toHaveBeenCalledWith(3);
      expect(mockEventInstance.update).toHaveBeenCalledWith(updateData);
      expect(result).toMatchObject({ ...updateData, event_id: "evt1" });
    });
    it("returns null if event is not found", async () => {
      Event.findByPk.mockResolvedValue(null);
      const result = await eventService.updateEvent("nonexistent", {});
      expect(result).toBeNull();
    });
  });
  
  describe("deleteEvent", () => {
    it("returns the number of deleted rows", async () => {
      Event.destroy.mockResolvedValue(1);
      const result = await eventService.deleteEvent("evt1");
      expect(Event.destroy).toHaveBeenCalledWith({ where: { event_id: "evt1" } });
      expect(result).toBe(1);
    });
  });
});
