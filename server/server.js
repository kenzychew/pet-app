const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");

// Set up allowed origins from environment variables
const allowedOrigins = [
  process.env.CLIENT_URL, // primary client URL
  process.env.SECONDARY_URL, // optional secondary URL
  "http://localhost:5173", // local development
].filter(Boolean); // removes any undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin - mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  exposedHeaders: ["Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(logger(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Add this after your CORS configuration
app.use((req, res, next) => {
  console.log("CORS Headers:", {
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers,
  });
  next();
});

// MongoDB connection configuration
const constructMongoURI = () => {
  const username = encodeURIComponent(process.env.MONGODB_USERNAME);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const cluster = process.env.MONGODB_CLUSTER;
  const database = process.env.MONGODB_DATABASE;

  return `mongodb+srv://${username}:${password}@${cluster}.dys46.mongodb.net/${database}?retryWrites=true&w=majority`;
};

// MongoDB connection
mongoose.connect(constructMongoURI(), {
  // added options for better stability
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
const authRouter = require("./routes/authRoutes");
const petRouter = require("./routes/petRoutes");
const groomerRouter = require("./routes/groomerRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");

app.use("/api/auth", authRouter);
app.use("/api/pets", petRouter);
app.use("/api/groomers", groomerRouter);
app.use("/api/appointments", appointmentRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
