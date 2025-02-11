const request = require("supertest");
const app = require("../../app");

const { connectDB } = require('../../config/db');
const { syncDatabase } = require('../../models');
const seedDatabase = require('../../seed/seedDatabase');

beforeAll(async () => {
  connectDB().then(async () => {
    await syncDatabase();
    await seedDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
});

function requestAgent() {
  return request.agent(app);
}

async function loginAsRole(username, password, roleName, email) {
  const agent = requestAgent();
  await agent
    .post("/auth/signup")
    .send({ username, password, roleName, email })
    .catch(() => {});
  console.log("Logging in as", { username, password });
  await agent.post("/auth/login").send({ username, password });
  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
