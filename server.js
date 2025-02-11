const app = require("./app");
const { connectDB } = require("./config/db");
const { syncDatabase } = require("./models");
const seedDatabase = require("./seed/seedDatabase");

connectDB().then(async () => {
  await syncDatabase();
  await seedDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
