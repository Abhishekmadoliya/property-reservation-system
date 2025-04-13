const express = require('express');
const router = express.Router();

const { 
    getFiltersHandler, 
    getLocationFiltersHandler,
    getPriceRangeHandler,
    getAmenitiesHandler
} = require("../controllers/filterController");

// Get all available filters
router.route("/")
    .get(getFiltersHandler);

// Get location filters (cities, states, etc)
router.route("/locations")
    .get(getLocationFiltersHandler);

// Get price range options
router.route("/price-range")
    .get(getPriceRangeHandler);

// Get available amenities
router.route("/amenities")
    .get(getAmenitiesHandler);

module.exports = router; 