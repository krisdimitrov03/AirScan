const { loginAsRole } = require("./testUtils");

describe("Admin Flights Integration", () => {
  let adminAgent;
  let createdFlightId; 
  
  beforeAll(async () => {
    adminAgent = await loginAsRole(
      `test_admin_flights_${Date.now()}`,
      "secret",
      "Administrator",
      "admin_flights@example.com"
    );
  });

  it("lists flights and extracts the created flight ID", async () => {
    const listRes = await adminAgent.get("/admin/flights");
    expect(listRes.statusCode).toBe(200);
    const match = listRes.text.match(/data-flight-id="([^"]+)"/);
    createdFlightId = match ? match[1] : null;
    expect(createdFlightId).toBeDefined();
  });
  
});
