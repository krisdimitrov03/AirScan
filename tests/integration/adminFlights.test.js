const { loginAsRole } = require("./testUtils");

describe("Admin Flights Integration", () => {
  let adminAgent;
  let createdFlightId; 
  
  beforeAll(async () => {
    adminAgent = await loginAsRole(
      "test_admin_flights",
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

  it("updates the created flight", async () => {
    const updateData = {
      origin_airport_code: "SFO",
      destination_airport_code: "LAX",
      direct_indirect_flag: "direct",
      return_option_flag: "false",
      scheduled_departure: "2025-12-11T06:00:00.000Z",
      scheduled_arrival: "2025-12-11T12:00:00.000Z",
    };
    const editRes = await adminAgent
      .post(`/admin/flights/${createdFlightId}/edit`)
      .send(updateData);
    expect(editRes.statusCode).toBe(302);
    expect(editRes.header.location).toBe("/admin/flights");
  });

});
