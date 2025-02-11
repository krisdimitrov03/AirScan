const { loginAsRole } = require("./testUtils");

describe("Pricing Integration", () => {
  let pricingAgent;
  let flightId;
  let createdPricingId;

  beforeAll(async () => {
    pricingAgent = await loginAsRole(
      "test_admin_pricing",
      "secret",
      "Administrator",
      "admin_pricing@example.com"
    );
  });
  
  it("lists pricing and extracts created pricing_id", async () => {
    const listPricingRes = await pricingAgent.get("/pricing");
    expect(listPricingRes.statusCode).toBe(200);
    const match = listPricingRes.text.match(/data-pricing-id="(\d+)"/);
    createdPricingId = match ? match[1] : null;
    expect(createdPricingId).toBeDefined();
  });

  it("updates the pricing record", async () => {
    const updatedData = {
      flight_id: flightId,
      effective_date_range_start: "2025-12-01",
      effective_date_range_end: "2025-12-31",
      base_price: 300,
      discounts_offered: 50,
      peak_season_surcharge: 100,
    };
    const updateRes = await pricingAgent
      .put(`/pricing/${createdPricingId}`)
      .send(updatedData);
    expect(updateRes.statusCode).toBe(302);
    expect(updateRes.header.location).toBe("/pricing");
  });

  it("deletes the pricing record", async () => {
    const delRes = await pricingAgent
      .delete(`/pricing/${createdPricingId}`);
    expect(delRes.statusCode).toBe(302);
    expect(delRes.header.location).toBe("/pricing");

    const listPricingRes = await pricingAgent.get("/pricing");
    expect(listPricingRes.text).not.toContain(`data-pricing-id="${createdPricingId}"`);
  });
});
