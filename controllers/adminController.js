const User = require('../model/user.model');
const Hotel = require('../model/hotel.model');

// Get dashboard statistics handler
const getDashboardStatsHandler = async (req, res) => {
    try {
        // In a real implementation, you would:
        // 1. Query your database for various statistics
        
        // For now, we'll return a placeholder response
        res.json({
            success: true,
            data: {
                userStats: {
                    total: 150,
                    new: 12,
                    active: 120
                },
                bookingStats: {
                    total: 320,
                    today: 8,
                    pending: 15,
                    cancelled: 5
                },
                revenue: {
                    total: 85750,
                    today: 2500,
                    monthly: 28400,
                    yearly: 85750
                },
                topDestinations: [
                    { name: "New York", bookings: 78 },
                    { name: "Miami", bookings: 65 },
                    { name: "Los Angeles", bookings: 54 },
                    { name: "Las Vegas", bookings: 48 },
                    { name: "Chicago", bookings: 32 }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard statistics",
            error: error.message
        });
    }
};

// Get all users handler
const getAllUsersHandler = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Update user handler (admin)
const updateUserHandler = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Build update object
        const updateData = { };
        if (req.body.username) updateData.username = req.body.username;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.number) updateData.number = req.body.number;
        
        // Update user
        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// Delete user handler (admin)
const deleteUserAdminHandler = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

// Get all hotels handler (admin)
const getAllHotelsAdminHandler = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        
        res.json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hotels",
            error: error.message
        });
    }
};

// Get all bookings handler (admin)
const getAllBookingsAdminHandler = async (req, res) => {
    try {
        // In a real implementation, you would:
        // 1. Query your database for all bookings
        // 2. Possibly populate with user and hotel details
        
        // For now, we'll return a placeholder response
        res.json({
            success: true,
            data: [
                {
                    id: "sample-booking-id-1",
                    hotelId: "sample-hotel-id-1",
                    userId: "sample-user-id-1",
                    checkIn: "2023-05-01",
                    checkOut: "2023-05-05",
                    guests: 2,
                    totalPrice: 500,
                    status: "confirmed",
                    createdAt: "2023-04-15"
                },
                {
                    id: "sample-booking-id-2",
                    hotelId: "sample-hotel-id-2",
                    userId: "sample-user-id-2",
                    checkIn: "2023-06-10",
                    checkOut: "2023-06-15",
                    guests: 3,
                    totalPrice: 750,
                    status: "pending",
                    createdAt: "2023-05-20"
                }
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStatsHandler,
    getAllUsersHandler,
    updateUserHandler,
    deleteUserAdminHandler,
    getAllHotelsAdminHandler,
    getAllBookingsAdminHandler
}; 