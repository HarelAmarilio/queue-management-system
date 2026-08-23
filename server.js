// Importing required modules and initializing environment variables
require("dotenv").config(); // טוען את הסיסמאות מקובץ ה-.env
const express = require("express");
const cors = require("cors");

// Importing the initDB function and pool object from db.js for database operations
const { initDB, pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Defining all possible time slots for appointments
const ALL_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Endpoint to check if the server is running
app.get("/", (req, res) => {
  res.send("Welcome to the Eyebrow Appointment API!");
});

// GET /api/available-slots
// Returns a list of available appointment slots for a given date, excluding already booked times.
app.get("/api/available-slots", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ error: "חובה לספק פרמטר date, לדוגמה: ?date=2026-08-25" });
    }

    // Fetching booked appointment times for the specified date from the database
    const [bookedRows] = await pool.execute(
      `SELECT appointment_time FROM Appointments
       WHERE appointment_date = ? AND status != 'cancelled'`,
      [date],
    );

    // Mapping the booked appointment times to a simple array of time strings (HH:MM)
    const bookedTimes = bookedRows.map((row) =>
      row.appointment_time.slice(0, 5),
    );

    // Filtering the ALL_TIME_SLOTS array to exclude booked times, resulting in available slots
    const availableSlots = ALL_TIME_SLOTS.filter(
      (slot) => !bookedTimes.includes(slot),
    );

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error("❌ Failed to fetch available slots:", error.message);
    res.status(500).json({ error: "שגיאה בשליפת השעות הפנויות" });
  }
});

// POST /api/appointments
// Creates a new appointment after validating input and checking for double bookings.
app.post("/api/appointments", async (req, res) => {
  try {
    const { client_name, client_phone, appointment_date, appointment_time } =
      req.body;

    // Validating that all required fields are provided in the request body. If any field is missing, a 400 Bad Request response is sent with an error message.
    if (
      !client_name ||
      !client_phone ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        error:
          "חובה לספק את כל השדות: client_name, client_phone, appointment_date, appointment_time",
      });
    }

    // Checking if the requested appointment slot is already booked by querying the database for existing appointments on the same date and time that are not cancelled. If a conflict is found, a 409 Conflict response is sent with an error message.
    const [existingRows] = await pool.execute(
      `SELECT id FROM Appointments
       WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
      [appointment_date, appointment_time],
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        error: "השעה המבוקשת כבר תפוסה, אנא בחר/י שעה אחרת",
      });
    }

    // Inserting the new appointment into the database using a parameterized query to prevent SQL injection. The status is set to 'pending' by default. After successful insertion, a 201 Created response is sent with the appointment details.
    const [result] = await pool.execute(
      `INSERT INTO Appointments (client_name, client_phone, appointment_date, appointment_time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [client_name, client_phone, appointment_date, appointment_time],
    );

    res.status(201).json({
      message: "התור נקבע בהצלחה!",
      appointment: {
        id: result.insertId,
        client_name,
        client_phone,
        appointment_date,
        appointment_time,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("❌ Failed to create appointment:", error.message);
    res.status(500).json({ error: "שגיאה בקביעת התור" });
  }
});

// Starting the server and initializing the database connection. The initDB function is called to ensure the database is ready before accepting requests. If the database connection fails, an error message is logged, but the server will still start.
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  try {
    await initDB();
    console.log("✅ Database connected and setup successfully");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
  }
});
