const express = require("express");
const cors = require("cors");
const userAuthRoutes = require("./routes/userAuthRoutes");
const authRoutes = require("./routes/authRoutes");
const metalPriceRoutes = require("./routes/metalPriceRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const app = express();

app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/user", userAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/metal-prices", metalPriceRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
module.exports = app;
