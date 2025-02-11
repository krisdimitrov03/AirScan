const request = require("supertest");
const app = require("../../app");

function requestAgent() {
  return request.agent(app);
}

async function loginAsRole(username, password, roleName, email) {
  const agent = requestAgent();
  console.log("AGGENT", agent)
  await agent
    .post("/auth/signup")
    .send({ username, password, roleName, email })
    .catch(() => {});
  await agent.post("/auth/login").send({ username, password });

  console.log({username, password})
  // check to see if the user is logged in
  const res = await agent.get("/flights");
  console.log("res", res.statusCode);

  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
