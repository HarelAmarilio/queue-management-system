// ייבוא הספריות שהתקנו
require("dotenv").config(); // טוען את הסיסמאות מקובץ ה-.env
const express = require("express");
const cors = require("cors");

// ייבוא פונקציית התחול מסד הנתונים ואת ה-Pool עצמו שיצרנו עם קלוד
const { initDB, pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

// הגדרות בסיסיות לשרת (Middlewares)
app.use(cors());
app.use(express.json()); // מאפשר לשרת להבין נתונים שמגיעים כ-JSON

// מערך קבוע המייצג את כל השעות האפשריות ליום עבודה מלא: 09:00 ... 18:00 בקפיצות של שעה.
// זהו "מקור האמת" (source of truth) של השעות התיאורטיות - לא תלוי במסד הנתונים,
// ולכן אין צורך לשלוף אותו מה-DB בכל פעם.
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

// נקודת קצה (Route) בסיסית לבדיקה שהשרת עובד
app.get("/", (req, res) => {
  res.send("Welcome to the Eyebrow Appointment API!");
});

// GET /api/available-slots?date=YYYY-MM-DD
// מחזיר ללקוח את רשימת השעות הפנויות בתאריך מסוים.
app.get("/api/available-slots", async (req, res) => {
  try {
    const { date } = req.query;

    // ולידציה בסיסית - בלי תאריך אין טעם לפנות בכלל למסד הנתונים
    if (!date) {
      return res
        .status(400)
        .json({ error: "חובה לספק פרמטר date, לדוגמה: ?date=2026-08-25" });
    }

    // גישת העבודה: שולפים מה-DB רק את השעות ה"תפוסות" (ולא מבקשים מה-DB לחשב בעצמו
    // מה "פנוי"), כי מסד הנתונים לא מכיר את רשימת השעות התיאורטיות של יום העבודה (09:00-18:00) -
    // היא קיימת רק בקוד שלנו (ALL_TIME_SLOTS). כלומר "פנוי" הוא מושג שקיים בלוגיקת
    // האפליקציה (Application Layer) ולא בסכימה של הטבלה, ולכן ה-DB לא יכול לחשב אותו לבד.
    // בנוסף, שאילתה כזו (WHERE appointment_date = ? AND status != 'cancelled') היא זולה
    // וממוקדת בהרבה מאשר לנסות "לבנות" ב-SQL את כל השעות הפנויות.
    const [bookedRows] = await pool.execute(
      `SELECT appointment_time FROM Appointments
       WHERE appointment_date = ? AND status != 'cancelled'`,
      [date],
    );

    // ה-DB מחזיר את appointment_time כמחרוזת בפורמט "HH:MM:SS" (למשל "09:00:00"),
    // בעוד שהמערך הקבוע שלנו מוגדר בפורמט "HH:MM" (למשל "09:00").
    // לכן חותכים את 5 התווים הראשונים (slice(0, 5)) כדי שהפורמטים יתאימו בהשוואה בהמשך.
    const bookedTimes = bookedRows.map((row) =>
      row.appointment_time.slice(0, 5),
    );

    // מחשבים את "השעות הפנויות" בצד השרת: מסננים (filter) את מערך כל השעות האפשריות,
    // ומשאירים רק שעות שלא מופיעות ברשימת השעות התפוסות שהתקבלה מה-DB.
    // כך אנחנו "מפחיתים" (set difference) בין כל השעות התיאורטיות לבין התפוסות בפועל.
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
// יוצר תור חדש עבור לקוח, לאחר בדיקת ולידציה ובדיקת זמינות בצד השרת.
app.post("/api/appointments", async (req, res) => {
  try {
    const { client_name, client_phone, appointment_date, appointment_time } =
      req.body;

    // ולידציה בסיסית - מוודאים שכל השדות קיימים ולא ריקים לפני שפונים בכלל ל-DB
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

    // *** בדיקת כפילויות (Double Booking) - חובה לבצע אותה כאן, בצד השרת ***
    // חשוב להבין: העובדה שה-Client (הדפדפן) הציג ללקוח רק שעות פנויות (מתוך
    // /api/available-slots) לא מבטיחה כלום בזמן שמירת התור בפועל! זהו מצב קלאסי
    // של Race Condition: יכולים לעבור שניות/דקות בין הרגע שהלקוח טען את רשימת
    // השעות הפנויות לבין הרגע שהוא לוחץ "אישור", ובדיוק בפער הזה לקוח אחר (מבקשה
    // מקבילה אחרת) יכול "לתפוס" את אותה שעה בדיוק. אם נסתמך רק על מה שהוצג בצד
    // הלקוח, שני לקוחות עלולים לקבל את אותה שעה בדיוק. לכן, ממש לפני ה-INSERT,
    // חייבים לשאול את ה-DB "האם השעה הזו עדיין פנויה?" - זהו מקור האמת היחיד
    // המהימן ברגע הכתיבה עצמה.
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

    // *** Parameterized Query - קריטי מבחינת אבטחה ***
    // שימוש בסימני "?" (placeholders) בתוך ה-SQL, יחד עם מערך ערכים נפרד שמועבר
    // ל-pool.execute, גורם ל-mysql2 לשלוח את השאילתה ואת הערכים בנפרד ל-MySQL -
    // ולא לבנות מחרוזת SQL אחת על ידי הדבקת (concatenation) קלט המשתמש ישירות
    // לתוך הפקודה. כך ה-DB "יודע" מראש מה מבנה השאילתה, וכל קלט מהמשתמש (גם אם
    // הוא מכיל תווים כמו ' או ; או SQL תקין) מטופל תמיד כערך גולמי בלבד ולא
    // כחלק מהפקודה. זה מונע לחלוטין התקפות SQL Injection - למשל לקוח ששולח
    // client_name בעל ערך כמו "'); DROP TABLE Appointments;--" לא יכול לגרום
    // נזק, כי הוא לעולם לא "יתפרש" כקוד SQL.
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

// הפעלת השרת
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // רגע האמת: מנסים להתחבר למסד הנתונים ולייצר את הטבלה
  try {
    await initDB();
    console.log("✅ Database connected and setup successfully");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
  }
});
