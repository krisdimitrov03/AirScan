const { syncDatabase } = require("./models");
const seedDatabase = require("./seed/seedDatabase");

module.exports = async () => {
  await syncDatabase();
  await seedDatabase();
};
