const express = require('express');
const router = express.Router();

const { 
    applyToBecomeHost,
    getHostApplicationStatus,
    processHostApplication,
    getAllHostApplications
} = require("../controllers/hostController");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

// Apply to become a host
router.route("/apply")
    .post(verifyUser, applyToBecomeHost);

// Get application status
router.route("/application-status")
    .get(verifyUser, getHostApplicationStatus);

// Debug route for development only
router.route("/debug-status")
    .get(verifyUser, async (req, res) => {
        try {
            const userId = req.user.id;
            const User = require('../model/user.model');
            
            // Find the user with full details
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            
            // Return detailed user info for debugging
            res.status(200).json({
                success: true,
                message: "Debug information retrieved",
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    hostApplicationStatus: user.hostApplicationStatus,
                    hostApplicationDate: user.hostApplicationDate,
                    hostInfo: user.hostInfo,
                    userSchema: Object.keys(user.toObject())
                }
            });
        } catch (error) {
            console.error('Debug route error:', error);
            res.status(500).json({
                success: false,
                message: "Error retrieving debug information",
                error: error.message
            });
        }
    });

// Admin: Process host applications
router.route("/process-application")
    .post(verifyUser, verifyAdmin, processHostApplication);

// Admin: Get all host applications
router.route("/applications")
    .get(verifyUser, verifyAdmin, getAllHostApplications);

module.exports = router; 