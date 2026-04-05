const express = require("express");
const recordRoutes = require("./src/routes/recordRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const errorResponder = require("./src/middlewares/errorResponder");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { globalLimiter } = require("./src/middlewares/rateLimiter");


const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);

app.use(errorResponder);

module.exports = app;