const Property = require('../models/propertyModel');
const User = require('../model/user.model');

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Host only)
exports.createProperty = async (req, res) => {
  try {
    // Check if user is a host
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'host') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only hosts can create properties' 
      });
    }

    // Create property with the host ID
    const property = new Property({
      ...req.body,
      host: req.user.id
    });

    // Save property to database
    await property.save();

    // Return success with the new property
    res.status(201).json({ 
      success: true, 
      property 
    });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all properties for a host
// @route   GET /api/properties
// @access  Private (Host only)
exports.getHostProperties = async (req, res) => {
  try {
    // Check if user is a host
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'host') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only hosts can access their properties' 
      });
    }

    // Find all properties for this host
    const properties = await Property.find({ host: req.user.id });

    // Return properties
    res.status(200).json({ 
      success: true, 
      count: properties.length,
      properties 
    });
  } catch (error) {
    console.error('Error in getHostProperties:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get a single property by ID
// @route   GET /api/properties/:id
// @access  Private
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('host', 'username email');

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // If not the owner and not admin, don't expose host details
    if (property.host._id.toString() !== req.user.id && req.user.role !== 'admin') {
      property.host = { username: property.host.username };
    }

    res.status(200).json({ 
      success: true, 
      property 
    });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner or Admin only)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Check ownership - only the host who created it or an admin can update
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this property' 
      });
    }

    // Update property
    property = await Property.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true, 
      property 
    });
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner or Admin only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Check ownership - only the host who created it or an admin can delete
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this property' 
      });
    }

    await property.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all properties (for public browsing)
// @route   GET /api/properties/public
// @access  Public
exports.getAllProperties = async (req, res) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build query object based on filter parameters
    const queryObj = {};
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseInt(req.query.maxPrice);
    }
    
    // Filter by location
    if (req.query.location) {
      queryObj.location = { $regex: req.query.location, $options: 'i' };
    }
    
    // Filter by capacity
    if (req.query.guests) {
      queryObj.guests = { $gte: parseInt(req.query.guests) };
    }
    
    // Filter by type
    if (req.query.type) {
      queryObj.type = req.query.type;
    }
    
    // Only show available properties
    queryObj.isAvailable = true;
    
    // Create the query
    const properties = await Property.find(queryObj)
      .select('-__v')
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort || '-createdAt');
    
    // Get total count for pagination
    const total = await Property.countDocuments(queryObj);
    
    // Send response
    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      properties
    });
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const properties = await Property.find({
      $text: { $search: searchTerm },
      isAvailable: true
    }).select('-__v');
    
    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Error in searchProperties:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Feature or unfeature a property (admin only)
// @route   PATCH /api/properties/:id/feature
// @access  Private (Admin only)
exports.toggleFeatureProperty = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can feature properties'
      });
    }
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Toggle featured status
    property.featured = !property.featured;
    await property.save();
    
    res.status(200).json({
      success: true,
      featured: property.featured,
      message: `Property ${property.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Error in toggleFeatureProperty:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Debug endpoint to get property counts
// @route   GET /api/properties/debug
// @access  Public
exports.getPropertyDebugInfo = async (req, res) => {
  try {
    // Get counts of properties
    const totalProperties = await Property.countDocuments();
    const availableProperties = await Property.countDocuments({ isAvailable: true });
    const unavailableProperties = await Property.countDocuments({ isAvailable: false });
    
    // Get some sample property data (limited fields for security)
    const sampleProperties = await Property.find()
      .select('title location price beds baths guests type isAvailable createdAt')
      .limit(5);
    
    res.status(200).json({
      success: true,
      counts: {
        total: totalProperties,
        available: availableProperties,
        unavailable: unavailableProperties
      },
      sampleProperties
    });
  } catch (error) {
    console.error('Error in getPropertyDebugInfo:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 