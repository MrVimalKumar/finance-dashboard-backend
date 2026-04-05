require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (! process.env.MONGO_URI) {
      console.error("MONGO_URI not defined");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;