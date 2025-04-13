const Hotel = require('../model/hotel.model');

// Get all hotels with filters
const getAllHotels = async (req, res) => {
    try {
        const { city, category, price, rating } = req.query;
        let query = {};

        // Apply filters
        if (city) {
            query.city = city;
        }
        if (category) {
            query.category = category;
        }
        if (price) {
            query.price = { $lte: Number(price) };
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        const hotels = await Hotel.find(query);
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

// Get featured hotels
const getFeaturedHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ rating: -1 }).limit(6);
        res.json({
            success: true,
            data: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured hotels",
            error: error.message
        });
    }
};

// Get hotel by ID
const getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        res.json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hotel",
            error: error.message
        });
    }
};

// Create new hotel (admin only)
const createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating hotel",
            error: error.message
        });
    }
};

// Update hotel (admin only)
const updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        res.json({
            success: true,
            data: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating hotel",
            error: error.message
        });
    }
};

// Delete hotel (admin only)
const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        res.json({
            success: true,
            message: "Hotel deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting hotel",
            error: error.message
        });
    }
};

module.exports = {
    getAllHotels,
    getFeaturedHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
}; 