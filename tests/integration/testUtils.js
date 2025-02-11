const request = require("supertest");
const app = require("../../app");

const { connectDB } = require('../../config/db');
const { syncDatabase } = require('../../models');
const seedDatabase = require('../../seed/seedDatabase');

beforeAll(async () => {
  await syncDatabase();
  await seedDatabase();
});

function requestAgent() {
  return request.agent(app);
}

async function loginAsRole(username, password, roleName, email) {
  const agent = requestAgent();
  await agent.post("/auth/login").send({ username:"admin", password: "Admin@123" });
  return agent;
}

module.exports = { loginAsRole, requestAgent, app };
