const express = require("express");
const helmet = require("helmet");

const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const bookRoutes = require("./routes/book-routes");
const authRoutes = require("./routes/auth-routes");

const app = express();
app.use(helmet());
mongoose
  .connect(process.env.DATABASE_URL || "mongodb://localhost:27017")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API !");
});

app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
