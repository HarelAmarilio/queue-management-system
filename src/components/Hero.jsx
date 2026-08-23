import { Link } from "react-router-dom"; // ייבוא רכיב הניווט של React

function Hero() {
  return (
    <main id="home" className="main-content">
      <h1>ברוכים הבאים לניני עיצוב גבות</h1>
      <p>
        ברוכה הבאה לעולם שבו דיוק, אסתטיקה ותחושת ביטחון נפגשים. כאן תוכלי לגלות
        את עיצוב הגבות המושלם שמתאים בדיוק לך.
      </p>

      {/* במקום תגית <a> רגילה שמרעננת את העמוד, אנחנו משתמשים ב-Link של הראוטר */}
      <Link to="/booking" className="booking-btn">
        לקביעת תור
      </Link>
    </main>
  );
}

export default Hero;
