const express = require("express");
const router = express.Router();
const {
  login,
  getAllAppointmentsForAdmin,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

// A route for admin login
router.post("/login", login);

// A route for getting all appointments for the admin user, protected by the verifyAdmin middleware
router.get("/appointments", verifyAdmin, getAllAppointmentsForAdmin);

module.exports = router;
