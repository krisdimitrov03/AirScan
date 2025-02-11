const { loginAsRole } = require("./testUtils");

describe("Non-Admin Airport Slots Integration", () => {
  let slotsAgent;
  let createdSlotId;

  beforeAll(async () => {
    slotsAgent = await loginAsRole(
      `test_slots_user_${Date.now()}`,
      "secret",
      "Analyst",
      "slots_user@example.com"
    );
  });

  it("lists airport slots and extracts the created slot_id", async () => {
    const listRes = await slotsAgent.get("/airport-slots");
    expect(listRes.statusCode).toBe(200);
    const match = listRes.text.match(/data-slot-id="(\d+)"/);
    createdSlotId = match ? match[1] : null;
    expect(createdSlotId).toBeDefined();
  });
});
