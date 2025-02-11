const { loginAsRole } = require("./testUtils");

describe("Pricing Integration", () => {
  let pricingAgent;
  let flightId;
  let createdPricingId;

  beforeAll(async () => {
    pricingAgent = await loginAsRole(
      `test_admin_pricing_${Date.now()}`,
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
});
