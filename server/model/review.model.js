const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    hotelId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel', 
        required: true 
    },
    userId: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5 
    },
    comment: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review; 