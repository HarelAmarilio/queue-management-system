const { google } = require("googleapis");

// הגדרת ה-oauth2Client והיומן
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5001/oauth2callback",
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// פונקציה להוספת אירוע ליומן
async function addEventToCalendar(
  clientName,
  clientPhone,
  appointmentDate,
  appointmentTime,
) {
  const eventStartTime = new Date(
    `${appointmentDate}T${appointmentTime}:00+03:00`,
  );
  const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `תור: ${clientName}`,
    description: `טלפון הלקוחה: ${clientPhone}`,
    start: {
      dateTime: eventStartTime.toISOString(),
      timeZone: "Asia/Jerusalem",
    },
    end: {
      dateTime: eventEndTime.toISOString(),
      timeZone: "Asia/Jerusalem",
    },
  };

  const googleResponse = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return googleResponse.data.id; // מחזיר את המזהה הייחודי של גוגל
}

// פונקציה למחיקת אירוע מהיומן
async function deleteEventFromCalendar(googleEventId) {
  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
  });
}

module.exports = {
  addEventToCalendar,
  deleteEventFromCalendar,
};
