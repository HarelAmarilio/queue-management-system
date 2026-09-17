import { useState, useEffect } from "react";
import { createAppointment, fetchAvailableSlots } from "../services/api";
// Setting the base URL for the API. This should match the backend server's address and port.
const API_BASE_URL = "http://localhost:5001";

function Booking() {
  const [date, setDate] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedTime, setSelectedTime] = useState("");

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

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

  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    fetchAvailableSlots(date);
    setSelectedTime("");
  }, [date]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date || !selectedTime || !name || !phone) {
      setMessage("נא למלא את כל השדות ולבחור שעה");
      return;
    }

    const cleanPhone = phone.replace(/[- ]/g, "");
    const phoneRegex = /^0\d{8,9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setMessage("מספר הטלפון אינו תקין. נא להזין מספר ישראלי חוקי.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const data = await createAppointment({
        client_name: name,
        client_phone: phone,
        appointment_date: date,
        appointment_time: selectedTime,
      });

      setMessage("התור נקבע בהצלחה! ✅");
      setDate("");
      setSelectedTime("");
      setName("");
      setPhone("");
      setAvailableSlots([]);
    } catch (error) {
      setMessage(
        error.data?.error || error.message || "שגיאה בקביעת התור, נסה/י שוב",
      );

      if (error.status === 409) {
        setSelectedTime("");
        try {
          const slots = await fetchAvailableSlots(date);
          setAvailableSlots(slots);
        } catch (fetchError) {
          console.error("שגיאה ברענון השעות הפנויות:", fetchError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const confirmed = window.confirm("האם את/ה בטוח/ה שברצונך לבטל את התור?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setAppointments((prevAppointments) =>
          prevAppointments.filter((app) => app.id !== appointmentId),
        );
        alert("התור בוטל בהצלחה ונמחק גם מהיומן! ✅");
      } else {
        alert(data.error || "שגיאה בביטול התור");
      }
    } catch (error) {
      console.error("❌ שגיאה במחיקת התור:", error);
      alert("שגיאה בהתחברות לשרת, נסה שוב מאוחר יותר.");
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

          <button
            onClick={() => handleDeleteAppointment(appointment.id)}
            className="submit-btn"
          >
            {" "}
            ביטול תור
          </button>

          {/* הודעת סטטוס/שגיאה למשתמש */}
          {message && <p className="booking-message">{message}</p>}
        </form>
      </div>
    </section>
  );
}

export default Booking;
