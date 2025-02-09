const express = require("express");
const methodOverride = require('method-override');
const { connectDB } = require("./config/db");
const { syncDatabase } = require("./models");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use("/", require("./routes"));

connectDB().then(async () => {
  await syncDatabase();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
