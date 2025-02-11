const AirportSlot = require("../../../models/AirportSlot");
const airportSlotService = require("../../../services/airportSlotService");
jest.mock("../../../models/AirportSlot");

describe("airportSlotService", () => {
  afterEach(() => { jest.clearAllMocks(); });
  
  describe("getAllSlots", () => {
    it("returns all airport slots", async () => {
      const mockSlots = [{ slot_id: 1 }, { slot_id: 2 }];
      AirportSlot.findAll.mockResolvedValue(mockSlots);
      const result = await airportSlotService.getAllSlots();
      expect(AirportSlot.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSlots);
    });
  });
  
  describe("getSlotById", () => {
    it("returns slot by id", async () => {
      const mockSlot = { slot_id: 1 };
      AirportSlot.findByPk.mockResolvedValue(mockSlot);
      const result = await airportSlotService.getSlotById(1);
      expect(AirportSlot.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSlot);
    });
  });
  
  describe("createSlot", () => {
    it("creates a new slot", async () => {
      const slotData = {
        airport_code: "LAX",
        date: "2025-12-01",
        time_slot_start: "10:00:00",
        time_slot_end: "12:00:00",
        slot_capacity: 100,
      };
      const createdSlot = { ...slotData, slot_id: 1 };
      AirportSlot.create.mockResolvedValue(createdSlot);
      const result = await airportSlotService.createSlot(slotData);
      expect(AirportSlot.create).toHaveBeenCalledWith(slotData);
      expect(result).toEqual(createdSlot);
    });
  });
  
  describe("updateSlot", () => {
    it("updates the slot when found", async () => {
      const slotId = 1;
      const slotData = { slot_capacity: 150 };
      const mockSlotInstance = { update: jest.fn().mockResolvedValue({ ...slotData, slot_id: slotId }) };
      AirportSlot.findByPk.mockResolvedValue(mockSlotInstance);
      const result = await airportSlotService.updateSlot(slotId, slotData);
      expect(AirportSlot.findByPk).toHaveBeenCalledWith(slotId);
      expect(mockSlotInstance.update).toHaveBeenCalledWith(slotData);
      expect(result).toEqual({ ...slotData, slot_id: slotId });
    });
    
    it("returns null if slot not found", async () => {
      AirportSlot.findByPk.mockResolvedValue(null);
      const result = await airportSlotService.updateSlot(999, { slot_capacity: 150 });
      expect(result).toBeNull();
    });
  });
  
  describe("deleteSlot", () => {
    it("returns true when deletion is successful", async () => {
      AirportSlot.destroy.mockResolvedValue(1);
      const result = await airportSlotService.deleteSlot(1);
      expect(AirportSlot.destroy).toHaveBeenCalledWith({ where: { slot_id: 1 } });
      expect(result).toBe(true);
    });
    
    it("returns false when no slot is deleted", async () => {
      AirportSlot.destroy.mockResolvedValue(0);
      const result = await airportSlotService.deleteSlot(999);
      expect(result).toBe(false);
    });
  });
});
