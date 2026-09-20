const jwt = require("jsonwebtoken");
const { pool } = require("../db");

// connnection function to the database
const login = (req, res) => {
  const { username, password } = req.body;

  // checking details with the .env file
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // generating a JWT token for the admin user
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ message: "התחברות מוצלחת", token });
  } else {
    res.status(401).json({ error: "שם משתמש או סיסמה שגויים." });
  }
};

const getAllAppointmentsForAdmin = async (req, res) => {
  try {
    // Fetch all appointments from the database, ordered by date and time
    const [rows] = await pool.execute(
      `SELECT * FROM Appointments ORDER BY appointment_date DESC, appointment_time DESC`,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ שגיאה בשליפת התורים לאדמין:", error.message);
    res.status(500).json({ error: "שגיאה בשליפת הנתונים" });
  }
};

module.exports = { login, getAllAppointmentsForAdmin };
