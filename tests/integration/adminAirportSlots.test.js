const { loginAsRole } = require("./testUtils");

describe("Admin Airport Slots Integration", () => {
  let adminAgent;
  let createdSlotId;

  beforeAll(async () => {
    adminAgent = await loginAsRole(
      `test_admin_slots_${Date.now()}`,
      "secret",
      "Administrator",
      "admin_slots@example.com"
    );
  });

  it("lists airport slots and extracts the created slot_id", async () => {
    const listRes = await adminAgent.get("/admin/airport-slots");
    expect(listRes.statusCode).toBe(200);
    const match = listRes.text.match(/data-slot-id="(\d+)"/);
    createdSlotId = match ? match[1] : null;
    expect(createdSlotId).toBeDefined();
  });
});
