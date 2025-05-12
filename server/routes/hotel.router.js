const express = require('express');
const router = express.Router();

const { 
    getAllHotels,
    getFeaturedHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
} = require("../controllers/hotel.controller");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyHost = require("../middleware/verifyHost");

// Get all hotels / Create new hotel
router.route("/")
    .get(getAllHotels)
    .post(verifyUser, verifyHost, createHotel);

// Get featured hotels
router.route("/featured")
    .get(getFeaturedHotels);

// Get hotel by ID
router.route("/:id")
    .get(getHotelById)
    .put(verifyUser, verifyHost, updateHotel)
    .delete(verifyUser, verifyHost, deleteHotel);

module.exports = router;