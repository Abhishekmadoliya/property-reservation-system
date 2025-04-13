const express = require('express');
const router = express.Router();

const { 
    createReviewHandler, 
    getHotelReviewsHandler, 
    updateReviewHandler, 
    deleteReviewHandler 
} = require("../controllers/reviewController");

const verifyUser = require("../middleware/verifyUser");

// Get all reviews for a hotel
router.route("/hotel/:hotelId")
    .get(getHotelReviewsHandler);

// Create a new review for a hotel
router.route("/hotel/:hotelId")
    .post(verifyUser, createReviewHandler);

// Update or delete a specific review
router.route("/:id")
    .put(verifyUser, updateReviewHandler)
    .delete(verifyUser, deleteReviewHandler);

module.exports = router; 