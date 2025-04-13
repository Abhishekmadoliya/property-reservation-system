const express = require('express');
const router = express.Router();

const { 
    getUserProfileHandler, 
    updateUserProfileHandler, 
    deleteUserHandler, 
    getUserBookingsHandler,
    debugTokenHandler,
    getCurrentUserHandler
} = require("../controllers/userController");

const verifyUser = require("../middleware/verifyUser");

// Get current user info (simplified endpoint)
router.route("/me")
    .get(verifyUser, getCurrentUserHandler);

// Get current user profile
router.route("/profile")
    .get(verifyUser, getUserProfileHandler)
    .put(verifyUser, updateUserProfileHandler)
    .delete(verifyUser, deleteUserHandler);

// Get user's bookings
router.route("/bookings")
    .get(verifyUser, getUserBookingsHandler);

// Debug route to check token validity
router.route("/debug-token")
    .get(verifyUser, debugTokenHandler);

module.exports = router; 