const express = require('express');
const router = express.Router();

const { 
    getAllUsersHandler, 
    getAllHotelsAdminHandler, 
    getAllBookingsAdminHandler, 
    getDashboardStatsHandler,
    updateUserHandler,
    deleteUserAdminHandler
} = require("../controllers/adminController");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

// Apply admin middleware to all routes
router.use(verifyUser, verifyAdmin);

// Get dashboard statistics
router.route("/dashboard")
    .get(getDashboardStatsHandler);

// Get all users
router.route("/users")
    .get(getAllUsersHandler);

// Update or delete a user (admin action)
router.route("/users/:id")
    .put(updateUserHandler)
    .delete(deleteUserAdminHandler);

// Get all hotels (admin view with additional data)
router.route("/hotels")
    .get(getAllHotelsAdminHandler);

// Get all bookings (admin view)
router.route("/bookings")
    .get(getAllBookingsAdminHandler);

module.exports = router; 