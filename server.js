// Importing required modules and initializing environment variables
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Importing the initDB function from db.js
const { initDB } = require("./db");

// Importing appointment routes
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Endpoint to check if the server is running
app.get("/", (req, res) => {
  res.send("Welcome to the Eyebrow Appointment API!");
});

// Using appointment routes
app.use("/api", appointmentRoutes);

// Starting the server and initializing the database connection
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  try {
    await initDB();
    console.log("✅ Database connected and setup successfully");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
  }
});
