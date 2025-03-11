const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");

// Import routers
const authRouter = require("./routes/authRoutes");
const petRouter = require("./routes/petRoutes");
const groomerRouter = require("./routes/groomerRoutes");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/pets", petRouter);
app.use("/api/groomers", groomerRouter);

app.listen(3000, () => {
  console.log("Express server is running on port 3000");
});
