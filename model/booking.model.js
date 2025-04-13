const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true 
    },
    hotelId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel', 
        required: true 
    },
    checkIn: { 
        type: Date, 
        required: true 
    },
    checkOut: { 
        type: Date, 
        required: true 
    },
    guests: { 
        type: Number, 
        required: true,
        min: 1
    },
    totalPrice: { 
        type: Number, 
        required: true,
        min: 0
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking; 