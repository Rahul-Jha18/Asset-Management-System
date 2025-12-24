// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");
const softwareRoutes = require("./routes/softwareRoutes");
const assetRoutes = require("./routes/assetRoutes");
const requestRoutes = require("./routes/requestRoutes");
const supportRoutes = require("./routes/supportRoutes");

// ✅ NEW: service stations route
const serviceStationRoutes = require("./routes/serviceStationRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

// ✅ IMPORTANT: load models + associations ONCE (before routes)
const Branch = require("./models/Branch");
const ServiceStation = require("./models/ServiceStation");

// ✅ Associations (must match "as" used in controller include)
Branch.belongsTo(ServiceStation, {
  foreignKey: "service_station_id",
  as: "serviceStation",
});
ServiceStation.hasMany(Branch, {
  foreignKey: "service_station_id",
  as: "branches",
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ✅ Rate limiting ONLY for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/branches", branchRoutes);

// ✅ NEW: for Branch.jsx dropdown (OG table)
app.use("/api/service-stations", serviceStationRoutes);

app.use("/api/software", softwareRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/support", supportRoutes);

// Test route
app.get("/", (req, res) => res.json({ message: "Project IMS backend running" }));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
