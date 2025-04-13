const User = require("../model/user.model");
const Booking = require("../model/booking.model");
const Hotel = require("../model/hotel.model");

// Get basic current user info - slim version of profile
const getCurrentUserHandler = async (req, res) => {
    try {
        // Find user by ID from the auth middleware
        const user = await User.findById(req.user.id).select('username email role _id');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user information",
            error: error.message
        });
    }
};

// Get user profile handler
const getUserProfileHandler = async (req, res) => {
    try {
        // Find user by ID from the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
};

// Update user profile handler
const updateUserProfileHandler = async (req, res) => {
    try {
        // Log the request data for debugging
        console.log('Update profile request:', {
            userId: req.user.id,
            body: req.body
        });
        
        // Fields that users can update
        const { username, email, number } = req.body;
        
        // Build update object
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (number !== undefined) updateData.number = Number(number); // Ensure it's a number
        
        console.log('Update data being applied:', updateData);
        
        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        console.log('Update successful, returning user:', user);
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// Debug endpoint to help troubleshoot token and user issues
const debugTokenHandler = async (req, res) => {
    try {
        // This will only be called if verifyUser middleware succeeds
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        res.json({
            success: true,
            message: "Token is valid",
            tokenData: req.user,
            userData: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in debug endpoint",
            error: error.message
        });
    }
};

// Delete user handler
const deleteUserHandler = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "User account deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

// Get user bookings handler
const getUserBookingsHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all bookings for this user
        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        
        // Get hotel details for each booking
        const bookingsWithHotelDetails = await Promise.all(
            bookings.map(async (booking) => {
                const hotel = await Hotel.findById(booking.hotelId);
                return {
                    ...booking.toObject(),
                    hotel: hotel ? {
                        id: hotel._id,
                        name: hotel.name,
                        image: hotel.image,
                        location: hotel.city + ', ' + hotel.state,
                        price: hotel.price
                    } : null
                };
            })
        );
        
        res.json({
            success: true,
            count: bookings.length,
            data: bookingsWithHotelDetails
        });
    } catch (error) {
        console.error('Error in getUserBookingsHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching booking history",
            error: error.message
        });
    }
};

module.exports = {
    getUserProfileHandler,
    updateUserProfileHandler,
    deleteUserHandler,
    getUserBookingsHandler,
    debugTokenHandler,
    getCurrentUserHandler
}; 