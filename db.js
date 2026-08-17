// db.js
// קובץ זה אחראי על הקמת החיבור למסד הנתונים MySQL, ועל אתחול הסכימה (טבלאות) של האפליקציה.

require('dotenv').config(); // טוען את משתני הסביבה מתוך קובץ .env (כמו DATABASE_URL) אל תוך process.env

const mysql = require('mysql2/promise');
// שימוש ב-mysql2/promise (ולא ב-mysql2 הרגיל) נותן לנו API שמבוסס Promises,
// ולכן אפשר לכתוב async/await במקום Callbacks מקוננים (מה שנקרא "Callback Hell").
// היתרון בקריאות: אפשר לטפל בשגיאות עם try/catch רגיל, אפשר להשתמש ב-await בכל שורה
// בצורה לינארית מלמעלה למטה, ולא צריך "לצייר" פונקציית callback(err, results) בכל שכבה
// כפי שנדרש בגרסה הישנה (Callback-based) של הספרייה.

// יצירת Connection Pool במקום Connection בודד:
// - חיבור בודד (createConnection) נפתח פעם אחת ונשאר "תפוס" עד לסגירתו. אם מגיעות כמה
//   בקשות במקביל (concurrent requests), הן ייאלצו לחכות בתור לאותו חיבור יחיד - צוואר בקבוק.
// - Pool (createPool) מחזיק מראש מאגר של כמה חיבורים פתוחים. כל בקשה "שואלת" חיבור פנוי
//   מהמאגר, ומחזירה אותו אוטומטית בסיום השאילתה (כשמשתמשים ב-pool.query/execute ישירות).
//   זה משפר ביצועים משמעותית תחת עומס, כי:
//     1. אין overhead של פתיחה/סגירה של חיבור TCP/הרשאות חדש לכל בקשה נכנסת.
//     2. אפשר לשרת כמה בקשות DB בו-זמנית (עד גודל ה-Pool) במקום שרשור אחד אחרי השני.
//     3. אם חיבור נופל/נסגר, ה-Pool דואג ליצור חיבור חלופי באופן שקוף, בלי להפיל את השרת.
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true, // אם כל החיבורים בפול תפוסים - בקשות חדשות ימתינו בתור, במקום להיכשל מיד
  connectionLimit: 10,      // מספר מקסימלי של חיבורים פתוחים בו-זמנית שה-Pool יחזיק
  queueLimit: 0,             // 0 = אין הגבלה על מספר הבקשות שיכולות להמתין בתור לחיבור פנוי
});

/**
 * initDB
 * פונקציה אסינכרונית שמיועדת לרוץ פעם אחת בעליית השרת (מתוך server.js).
 * תפקידיה:
 *   1. לוודא שהחיבור למסד הנתונים תקין - "Fail Fast" אם פרטי ההתחברות שגויים,
 *      כדי שנגלה בעיה מיד עם עליית השרת ולא בזמן הבקשה הראשונה של לקוח אמיתי.
 *   2. ליצור את טבלת Appointments אם היא עדיין לא קיימת (IF NOT EXISTS),
 *      כך שהשרת יודע "להקים את עצמו" גם מול מסד נתונים ריק, בלי סקריפט הגדרה נפרד.
 */
async function initDB() {
  try {
    // שולפים חיבור מה-Pool כדי לוודא שהוא "חי" ותקין - בזכות mysql2/promise
    // הקריאה מחזירה Promise, ולכן אפשר לעשות await ישירות בלי callback.
    const connection = await pool.getConnection();
    console.log('החיבור למסד הנתונים MySQL הצליח');
    connection.release(); // מחזירים את החיבור לפול כדי שיהיה זמין לשימוש הבא (לא סוגרים אותו!)

    // יצירת הטבלה אם היא לא קיימת - כך אפשר להריץ את השרת גם על DB ריק לגמרי
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending'
      )
    `);
    console.log('טבלת Appointments מוכנה לשימוש');
  } catch (error) {
    console.error('שגיאה באתחול מסד הנתונים:', error.message);
    // זורקים את השגיאה הלאה כדי ש-server.js יוכל להחליט לא להפעיל את השרת
    // אם אין חיבור תקין ל-DB, במקום לעלות "בשקט" עם שרת שלא באמת עובד.
    throw error;
  }
}

// מייצאים גם את ה-Pool עצמו וגם את initDB, כדי ש-server.js וקבצי routes/controllers אחרים
// יוכלו לייבא אותם ב-CommonJS ולהריץ שאילתות משלהם, לדוגמה:
//   const { pool, initDB } = require('./db.js');
//   const [rows] = await pool.query('SELECT * FROM Appointments');
module.exports = { pool, initDB };
