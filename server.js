const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override');
const { connectDB } = require("./config/db");
const { syncDatabase } = require("./models");
const seedDatabase = require("./seed/seedDatabase");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use("/", require("./routes"));

// only start the server if this file is the entry file
if (require.main === module) {
  connectDB().then(async () => {
    await syncDatabase();
    await seedDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
}

module.exports = app;