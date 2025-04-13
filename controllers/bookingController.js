const Booking = require('../model/booking.model');
const Hotel = require('../model/hotel.model');
const mongoose = require('mongoose');

// Create booking handler
const createBookingHandler = async (req, res) => {
    try {
        const { hotelId, checkIn, checkOut, guests, totalPrice } = req.body;
        const userId = req.user.id;

        // Validate hotelId format
        if (!mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hotel ID format"
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

        // Create a new booking
        const newBooking = new Booking({
            userId,
            hotelId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            totalPrice,
            status: 'confirmed', // Set initial status
            paymentStatus: 'paid' // Assuming payment is handled separately
        });

        await newBooking.save();

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking
        });
    } catch (error) {
        console.error('Error in createBookingHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error creating booking",
            error: error.message
        });
    }
};

// Get booking details handler
const getBookingHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        // Find the booking
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Ensure user is authorized (is the booking owner or an admin)
        if (booking.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking"
            });
        }

        // Get hotel details for the booking
        const hotel = await Hotel.findById(booking.hotelId);

        res.json({
            success: true,
            data: {
                ...booking.toObject(),
                hotel: hotel ? {
                    id: hotel._id,
                    name: hotel.name,
                    image: hotel.image,
                    location: hotel.city + ', ' + hotel.state,
                    price: hotel.price
                } : null
            }
        });
    } catch (error) {
        console.error('Error in getBookingHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching booking details",
            error: error.message
        });
    }
};

// Update booking handler
const updateBookingHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, guests, status } = req.body;
        const userId = req.user.id;

        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        // Find the booking
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Ensure user is authorized (is the booking owner or an admin)
        if (booking.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this booking"
            });
        }

        // Update fields
        if (checkIn) booking.checkIn = new Date(checkIn);
        if (checkOut) booking.checkOut = new Date(checkOut);
        if (guests) booking.guests = guests;
        if (status && req.user.role === 'admin') booking.status = status; // Only admin can change status

        await booking.save();

        res.json({
            success: true,
            message: "Booking updated successfully",
            data: booking
        });
    } catch (error) {
        console.error('Error in updateBookingHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error updating booking",
            error: error.message
        });
    }
};

// Cancel booking handler
const cancelBookingHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        // Find the booking
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Ensure user is authorized (is the booking owner or an admin)
        if (booking.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to cancel this booking"
            });
        }

        // Update status to cancelled
        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking
        });
    } catch (error) {
        console.error('Error in cancelBookingHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error cancelling booking",
            error: error.message
        });
    }
};

// Get all bookings handler (admin only)
const getAllBookingsHandler = async (req, res) => {
    try {
        // For admins, get all bookings
        // Could include pagination here
        const bookings = await Booking.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error in getAllBookingsHandler:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message
        });
    }
};

// Get user's bookings
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
            message: "Error fetching user bookings",
            error: error.message
        });
    }
};

module.exports = {
    createBookingHandler,
    getBookingHandler,
    updateBookingHandler,
    cancelBookingHandler,
    getAllBookingsHandler,
    getUserBookingsHandler
}; 