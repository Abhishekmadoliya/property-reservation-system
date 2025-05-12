const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    // Basic Info - matches form fields
    name: { type: String, required: true }, // from title in form
    description: { type: String, required: false },
    address: { type: String, required: false }, // from location in form (split)
    city: { type: String, required: false }, // from location in form (split)
    state: { type: String, required: false }, // from location in form (split)
    country: { type: String, default: 'USA', required: false },
    
    // Property details - matches form fields
    price: { type: Number, required: true }, // from price in form
    numberOfBathrooms: { type: Number, required: false, default: 1 }, // from baths in form
    numberOfBeds: { type: Number, required: false, default: 1 }, // from beds in form
    numberOfguest: { type: Number, required: false, default: 1 }, // from guests in form
    numberOfBedrooms: { type: Number, required: false, default: 1 }, // calculated from beds
    numberOfStudies: { type: Number, required: false, default: 0 },
    
    // Categories and types - matches form fields
    category: { type: String, required: false, default: 'Entire home' }, // from type in form
    propertyType: { type: String, required: false, default: 'Entire home' }, // from type in form
    
    // Images - matches form fields
    image: { type: String, required: false, default: 'https://a0.muscache.com/im/pictures/miso/Hosting-26117817/original/9da40e3c-5846-4359-bb41-05c27b09a8f5.jpeg?im_w=720' }, // first image from images array
    imageArr: { type: Array, required: false, default: [] }, // from images in form
    
    // Host information - filled automatically
    hostName: { type: String, required: false, default: 'Host' },
    hostJoinedOn: { type: String, required: false, default: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
    
    // Amenities and rules - matches form fields
    ameneties: { type: Array, required: false, default: [] }, // from amenities in form
    healthAndSafety: { type: Array, required: false, default: ['Smoke alarm', 'Carbon monoxide alarm'] },
    houseRules: { type: Array, required: false, default: ['Check-in: 3:00 pm', 'Check out: 11:00 am'] },
    
    // Bookings and availability - matches form fields
    isAvailable: { type: Boolean, required: false, default: true },
    isCancelable: { type: Boolean, required: false, default: true },
    
    // Ratings and reviews - auto-generated
    rating: { type: Number, required: false, default: 4.5 },
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;