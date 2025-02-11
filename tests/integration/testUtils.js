const request = require("supertest");
const app = require("../../app");

function requestAgent() {
  return request.agent(app);
}

async function loginAsRole(username, password, roleName, email) {
  const agent = requestAgent();
  await agent
    .post("/auth/signup")
    .send({ username, password, roleName, email })
    .catch(() => {});
  await agent.post("/auth/login").send({ username, password }).redirects(1);
  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
