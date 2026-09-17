const express = require("express");
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

// הגדרת נתיבים תחת /api/appointments
router.get("/available-slots", getAvailableSlots);
router.post("/appointments", createAppointment);
router.delete("/appointments/:id", deleteAppointment);

module.exports = router;
