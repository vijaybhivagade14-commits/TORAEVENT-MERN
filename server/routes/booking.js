const express = require("express");

const router = express.Router();

const { protect, admin } = require("../middleware/auth");
const { bookEvent, sendBookingOtp, getMyBookings, confirmBooking, cancelBooking, getAllBookings } = require("../controllers/bookingController");

//Create Booking
router.post("/", protect, bookEvent);

//Send OTP for Booking
router.post('/send-otp', protect, sendBookingOtp);

//Get User Bookings
router.get("/my", protect, getMyBookings);

//Get All Bookings (Admin only)
router.get("/all", protect, admin, getAllBookings);

//Confirm Booking (Admin only)
router.put("/:id/confirm", protect, admin, confirmBooking);

//Cancel Booking (Booking owner)
router.delete("/:id", protect, cancelBooking);

module.exports = router;
