const express = require('express');
const router = express.Router();

const { 
    createBookingHandler, 
    getBookingHandler, 
    updateBookingHandler, 
    cancelBookingHandler, 
    getAllBookingsHandler 
} = require("../controllers/bookingController");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

// Create booking / Get all bookings (admin only)
router.route("/")
    .post(verifyUser, createBookingHandler)
    .get(verifyUser, verifyAdmin, getAllBookingsHandler);

// Get, update or cancel specific booking
router.route("/:id")
    .get(verifyUser, getBookingHandler)
    .put(verifyUser, updateBookingHandler)
    .delete(verifyUser, cancelBookingHandler);

module.exports = router; 