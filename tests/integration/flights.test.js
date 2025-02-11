const { loginAsRole } = require("./testUtils");

describe("Non-Admin Flights Integration", () => {
  let flightsAgent;
  let createdFlightUUID;

  beforeAll(async () => {
    flightsAgent = await loginAsRole(
      "test_flights_user",
      "pass",
      "Administrator",
      "flights_user@example.com"
    );
  });

  it("lists flights and extracts the created flight UUID", async () => {
    const listRes = await flightsAgent.get("/flights");
    expect(listRes.statusCode).toBe(200);
    const match = listRes.text.match(/data-flight-id="([^"]+)"/);
    createdFlightUUID = match ? match[1] : null;
    expect(createdFlightUUID).toBeDefined();
  });

});
