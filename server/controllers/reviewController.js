const Review = require('../model/review.model');
const User = require('../model/user.model');
const Hotel = require('../model/hotel.model');
const Booking = require('../model/booking.model');
const mongoose = require('mongoose');

// Get hotel reviews handler
const getHotelReviewsHandler = async (req, res) => {
    try {
        const { hotelId } = req.params;
        
        // Validate hotelId format
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID format"
            });
        }
        
        // Find reviews for the specified hotel
        const reviews = await Review.find({ hotelId })
            .sort({ date: -1 }); // Most recent first
        
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error in getHotelReviewsHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching reviews",
            error: error.message
        });
    }
};

// Create review handler
const createReviewHandler = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        
        console.log('Create review request:', { userId, hotelId, rating, comment });
        
        // Validate hotelId format
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID format"
            });
        }
        
        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }
        
        if (!comment || comment.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }
        
        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        
        // Check if user has a confirmed or completed booking for this hotel
        const userBooking = await Booking.findOne({
            userId,
            hotelId,
            status: { $in: ['confirmed', 'completed'] }
        });
        
        if (!userBooking && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You must book and stay at this property before leaving a review"
            });
        }
        
        // Check if user has already reviewed this hotel
        const existingReview = await Review.findOne({ hotelId, userId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this property"
            });
        }
        
        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        console.log('User found for review:', { 
            id: user._id, 
            username: user.username,
            role: user.role
        });
        
        // Create a new review with explicit username
        const newReview = new Review({
            hotelId,
            userId,
            username: user.username || 'Anonymous User',
            rating,
            comment,
            date: new Date()
        });
        
        await newReview.save();
        console.log('Review saved successfully:', newReview);
        
        // Update hotel's average rating
        const allReviews = await Review.find({ hotelId });
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / allReviews.length;
        
        hotel.rating = parseFloat(averageRating.toFixed(1));
        await hotel.save();
        
        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: newReview
        });
    } catch (error) {
        console.error('Error in createReviewHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error creating review",
            error: error.message
        });
    }
};

// Update review handler
const updateReviewHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        
        // Validate reviewId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID format"
            });
        }
        
        // Validate input
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }
        
        // Find the review by ID
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        
        // Verify the user is authorized to update it
        if (review.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this review"
            });
        }
        
        // Update the review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;
        
        await review.save();
        
        // If rating changed, update hotel's average rating
        if (rating) {
            const hotelId = review.hotelId;
            const allReviews = await Review.find({ hotelId });
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / allReviews.length;
            
            const hotel = await Hotel.findById(hotelId);
            if (hotel) {
                hotel.rating = parseFloat(averageRating.toFixed(1));
                await hotel.save();
            }
        }
        
        res.json({
            success: true,
            message: "Review updated successfully",
            data: review
        });
    } catch (error) {
        console.error('Error in updateReviewHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error updating review",
            error: error.message
        });
    }
};

// Delete review handler
const deleteReviewHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Validate reviewId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID format"
            });
        }
        
        // Find the review by ID
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }
        
        // Verify the user is authorized to delete it
        if (review.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review"
            });
        }
        
        const hotelId = review.hotelId;
        
        // Delete the review
        await review.deleteOne();
        
        // Update hotel's average rating
        const allReviews = await Review.find({ hotelId });
        
        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / allReviews.length;
            
            const hotel = await Hotel.findById(hotelId);
            if (hotel) {
                hotel.rating = parseFloat(averageRating.toFixed(1));
                await hotel.save();
            }
        }
        
        res.json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteReviewHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting review",
            error: error.message
        });
    }
};

module.exports = {
    getHotelReviewsHandler,
    createReviewHandler,
    updateReviewHandler,
    deleteReviewHandler
}; 