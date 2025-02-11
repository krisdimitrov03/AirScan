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

  it("updates the created flight", async () => {
    const updateData = {
      origin_airport_code: "SFO",
      destination_airport_code: "LAX",
      direct_indirect_flag: "direct",
      return_option_flag: "false",
      scheduled_departure: "2025-12-11T06:00:00.000Z",
      scheduled_arrival: "2025-12-11T12:00:00.000Z",
    };
    const resUpdate = await flightsAgent
      .put(`/flights/${createdFlightUUID}`)
      .send(updateData);
    expect(resUpdate.statusCode).toBe(302);
    expect(resUpdate.header.location).toBe("/flights");
  });

});
