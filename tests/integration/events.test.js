const { loginAsRole } = require("./testUtils");

describe("Events Integration", () => {
  let eventsAgent;
  const eventId = "TEST-EVT-123";

  beforeAll(async () => {
    eventsAgent = await loginAsRole(
      "admin",
      "admin123",
      "Administrator",
      "admin_events@example.com"
    );
  });

  it("creates a new event", async () => {
    const eventData = {
      event_id: eventId,
      event_name: "Integration Test Event",
      location_city: "Test City",
      start_date: "2025-01-01",
      end_date: "2025-01-05",
      expected_additional_traffic_factor: 2,
    };
    const res = await eventsAgent
      .post("/events")
      .send(eventData);
    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe("/events");
  });

  it("lists events and finds the created event", async () => {
    const listRes = await eventsAgent.get("/events");
    expect(listRes.statusCode).toBe(200);
    expect(listRes.text).toContain("Integration Test Event");
    expect(listRes.text).toContain(eventId);
  });

  it("updates the event", async () => {
    const updateData = {
      event_name: "Updated Integration Event",
      location_city: "Updated City",
      start_date: "2025-01-02",
      end_date: "2025-01-06",
      expected_additional_traffic_factor: 3,
    };
    const editRes = await eventsAgent
      .put(`/events/${eventId}`)
      .send(updateData);
    expect(editRes.statusCode).toBe(302);
    expect(editRes.header.location).toBe("/events");
  });

  it("deletes the event", async () => {
    const delRes = await eventsAgent
      .delete(`/events/${eventId}`);
    expect(delRes.statusCode).toBe(302);
    expect(delRes.header.location).toBe("/events");

    const listAgain = await eventsAgent.get("/events");
    expect(listAgain.text).not.toContain("Updated Integration Event");
    expect(listAgain.text).not.toContain(eventId);
  });
});
