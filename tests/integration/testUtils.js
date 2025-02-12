const request = require("supertest");
const app = require("../../app");

function requestAgent() {
  return request.agent(app);
}

async function loginAsRole(username, password, roleName, email) {
  const agent = requestAgent();
  await agent
    .post("/auth/login")
    .send({ username: "admin", password: "Admin@123" });
  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
