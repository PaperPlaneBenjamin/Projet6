const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const bookRoutes = require("./routes/book-routes");
const authRoutes = require("./routes/auth-routes");

// Connexion à MongoDB
const app = express();
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
