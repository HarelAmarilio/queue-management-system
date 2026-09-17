// src/services/api.js
const API_BASE_URL = "http://localhost:5001/api";

// 1. fething available slots for a given date
export const fetchAvailableSlots = async (date) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/available-slots?date=${date}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "שגיאה בשליפת השעות הפנויות");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error (fetchAvailableSlots):", error.message);
    throw error;
  }
};

// 2. Creating a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || "שגיאה בקביעת התור");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("❌ API Error (createAppointment):", error.message);
    throw error;
  }
};

// Deleting an appointment by ID
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        method: "DELETE",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "שגיאה בביטול התור");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error (deleteAppointment):", error.message);
    throw error;
  }
};
