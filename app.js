const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
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
app.use(methodOverride("_method"));
app.use("/", require("./routes"));

module.exports = app;
