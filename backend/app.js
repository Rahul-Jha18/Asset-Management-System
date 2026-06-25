const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const adminUserRoutes = require("./routes/adminUserRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const userImportRoutes = require("./routes/userImportRoutes");
const backupRoutes = require("./routes/backupRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const branchIssueRoutes = require("./routes/branchIssueRoutes");
const assetTrackingRoutes = require("./routes/assetTrackingRoutes");

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.disable("x-powered-by");

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_VITE,

  // Current frontend URL
  "http://192.168.0.244:3000",

  // Other local/network frontend ports
  "http://192.168.0.244:3001",

  // Local development
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    if (origin.startsWith("vscode-webview://")) {
      return cb(null, true);
    }

    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "Expires",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Preflight support
app.options("*", cors(corsOptions));

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Logs
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limit for auth only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/branches", require("./routes/branchRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/service-stations", require("./routes/serviceStationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api", require("./routes/assetMetaRoutes"));
app.use("/api/v1/branch-issues", branchIssueRoutes);

app.use("/api/employees", employeeRoutes);
app.use("/api/asset-tracking", assetTrackingRoutes);

// Asset transfer routes
// Main existing route:
// POST /api/assets/transfer
// GET  /api/assets/transfer-history
app.use("/api/assets", require("./routes/assetTransferRoutes"));

// Optional alias route:
// POST /api/asset-transfers/transfer
// GET  /api/asset-transfers/transfer-history
app.use("/api/asset-transfers", require("./routes/assetTransferRoutes"));

app.use("/api/maintenance", require("./routes/assetMaintenanceRoutes"));
app.use("/api/assets", require("./routes/assetImportRoutes"));
app.use("/api/asset-history", require("./routes/assetHistoryRoutes"));
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/backup", backupRoutes);
app.use("/api/assets", require("./routes/assetRoutes"));
app.use("/api/users", userImportRoutes);
app.use("/api/files", require("./routes/fileRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Project IMS backend running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

module.exports = app;