const express = require('express');
const router = express.Router();

const { 
    processPaymentHandler, 
    getPaymentDetailsHandler,
    getPaymentHistoryHandler,
    verifyPaymentHandler 
} = require("../controllers/paymentController");

const verifyUser = require("../middleware/verifyUser");

// Process a new payment
router.route("/")
    .post(verifyUser, processPaymentHandler);

// Get payment history for current user
router.route("/history")
    .get(verifyUser, getPaymentHistoryHandler);

// Verify payment (webhook)
router.route("/verify")
    .post(verifyPaymentHandler);

// Get details of a specific payment
router.route("/:id")
    .get(verifyUser, getPaymentDetailsHandler);

module.exports = router; 