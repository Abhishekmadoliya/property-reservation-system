const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  beds: { 
    type: Number, 
    required: true,
    default: 1,
    min: 1 
  },
  baths: { 
    type: Number, 
    required: true,
    default: 1,
    min: 1 
  },
  guests: { 
    type: Number, 
    required: true,
    default: 1,
    min: 1 
  },
  type: {
    type: String,
    enum: ['Entire home', 'Private room', 'Shared room', 'Hotel', 'Unique space'],
    default: 'Entire home'
  },
  amenities: [{ 
    type: String 
  }],
  images: [{ 
    type: String 
  }],
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // For future booking functionality
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Additional fields for search and filtering
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for search performance
propertySchema.index({ location: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema); 