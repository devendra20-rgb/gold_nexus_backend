const express = require("express");
const cors = require("cors");
const userAuthRoutes = require("./routes/userAuthRoutes");
const authRoutes = require("./routes/authRoutes");
const metalPriceRoutes = require("./routes/metalPriceRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const horoscopeRoutes = require("./routes/horoscopeRoutes");
const domandintRoutes = require("./routes/domandintRoutes");
const app = express();

/* ---------------- BASIC MIDDLEWARE ---------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- CORS SETUP ---------------- */
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,https://www.headlines24x7.com,https://headlines24x7.com,https://goldnexusfrontend.vercel.app/"
)
  .split(",")
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, Postman, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED ORIGIN:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept"
    ]
  })
);

// ✅ IMPORTANT: handle preflight
app.options("*", cors());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/user", userAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/metal-prices", metalPriceRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/domandint", domandintRoutes);
/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);

  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});

module.exports = app;
