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
  await agent.post("/auth/login").send({ username, password });
  
  // check to see if the user is logged in
  const res = await agent.get("/auth/logged-in");
  console.log("res", res);

  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
