const { loginAsRole } = require("./testUtils");

describe("Admin Integration (Users & Roles)", () => {
  let adminAgent;
  let createdUserId;
  let createdRoleId;

  beforeAll(async () => {
    adminAgent = await loginAsRole(
      "test_superadmin",
      "pass",
      "Administrator",
      "superadmin@example.com"
    );
  });

  // --------------------- ROLES ---------------------
  it("lists roles and extracts created role_id", async () => {
    const listRes = await adminAgent.get("/admin/roles");
    expect(listRes.statusCode).toBe(200);
    const match = listRes.text.match(/data-role-id="(\d+)".*?TempRoleForTesting/);
    createdRoleId = match ? match[1] : null;
    expect(createdRoleId).toBeDefined();
  });

  // --------------------- USERS ---------------------
  it("lists users and extracts created user_id", async () => {
    const listUsersRes = await adminAgent.get("/admin/users");
    expect(listUsersRes.statusCode).toBe(200);
    const match = listUsersRes.text.match(/data-user-id="(\d+)".*?temp_user/);
    createdUserId = match ? match[1] : null;
    expect(createdUserId).toBeDefined();
  });
});
