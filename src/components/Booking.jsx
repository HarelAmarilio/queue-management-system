import { useState, useEffect } from "react";

// כתובת הבסיס של השרת (Backend) שרץ מקומית
const API_BASE_URL = "http://localhost:5001";

function Booking() {
  // date - התאריך שנבחר בשדה ה-input מסוג date
  const [date, setDate] = useState("");

  // availableSlots - מערך השעות הפנויות שמתקבל מהשרת עבור התאריך שנבחר
  const [availableSlots, setAvailableSlots] = useState([]);

  // selectedTime - השעה שהמשתמש בחר מתוך רשימת הכפתורים
  const [selectedTime, setSelectedTime] = useState("");

  // name / phone - הפרטים שהלקוח מזין בטופס
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // message - הודעת סטטוס/שגיאה שמוצגת למשתמש (הצלחה, שעה תפוסה, שגיאת שרת וכו')
  const [message, setMessage] = useState("");

  // isLoading - מציין אם מתבצעת כרגע שליחת בקשה (למניעת לחיצות כפולות על Submit)
  const [isLoading, setIsLoading] = useState(false);

  // minDate - תאריך היום בפורמט YYYY-MM-DD, משמש כערך min בשדה התאריך
  // כדי לחסום מהלקוח לבחור תאריך שכבר עבר. מחושב פעם אחת (לא state כי אינו משתנה תוך כדי הרינדור).
  const minDate = new Date().toISOString().split("T")[0];

  // fetchAvailableSlots - שולפת מהשרת את השעות הפנויות עבור תאריך נתון
  const fetchAvailableSlots = async (selectedDate) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/available-slots?date=${selectedDate}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "שגיאה בשליפת השעות הפנויות");
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots(data);
    } catch (error) {
      console.error("❌ Failed to fetch available slots:", error.message);
      setMessage("שגיאה בהתחברות לשרת, נסה/י שוב מאוחר יותר");
      setAvailableSlots([]);
    }
  };

  // useEffect - רץ מחדש בכל פעם שה-state של date משתנה (כלומר, בכל בחירת תאריך חדשה)
  // ומביא מחדש את רשימת השעות הפנויות עבור התאריך הנבחר
  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    fetchAvailableSlots(date);
    // מאפסים את השעה שנבחרה קודם, כי היא שייכת לתאריך אחר
    setSelectedTime("");
  }, [date]);

  // handleSubmit - שולח את בקשת קביעת התור (POST) לשרת
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date || !selectedTime || !name || !phone) {
      setMessage("נא למלא את כל השדות ולבחור שעה");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: name,
          client_phone: phone,
          appointment_date: date,
          appointment_time: selectedTime,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // הצלחה - מציגים הודעה ומאפסים את הטופס
        setMessage("התור נקבע בהצלחה! ✅");
        setDate("");
        setSelectedTime("");
        setName("");
        setPhone("");
        setAvailableSlots([]);
      } else if (response.status === 409) {
        // Conflict - מישהו הספיק לתפוס את השעה בינתיים (תנאי מרוץ)
        setMessage("השעה נתפסה, אנא בחר שעה אחרת");
        setSelectedTime("");
        // מרעננים את רשימת השעות הפנויות כדי לשקף את המצב העדכני
        fetchAvailableSlots(date);
      } else {
        setMessage(data.error || "שגיאה בקביעת התור, נסה/י שוב");
      }
    } catch (error) {
      console.error("❌ Failed to create appointment:", error.message);
      setMessage("שגיאה בהתחברות לשרת, נסה/י שוב מאוחר יותר");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="booking" className="booking-section">
      <div className="booking-card">
        <h2>קביעת תור</h2>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-field">
            <label htmlFor="booking-date">בחרי תאריך</label>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          {/* רשימת השעות הפנויות מוצגת ככפתורים לבחירה, בתצוגת רשת */}
          {date && (
            <div className="form-field">
              <label>בחרי שעה</label>
              <div className="time-slots">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-button ${
                        selectedTime === slot ? "selected" : ""
                      }`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="no-slots-message">אין שעות פנויות בתאריך זה</p>
                )}
              </div>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="booking-name">שם מלא</label>
            <input
              id="booking-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="שם מלא"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="booking-phone">טלפון</label>
            <input
              id="booking-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="050-0000000"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "שולח..." : "קביעת תור"}
          </button>

          {/* הודעת סטטוס/שגיאה למשתמש */}
          {message && <p className="booking-message">{message}</p>}
        </form>
      </div>
    </section>
  );
}

export default Booking;
