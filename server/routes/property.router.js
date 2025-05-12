const express = require('express');
const { 
  createProperty, 
  getHostProperties, 
  getPropertyById, 
  updateProperty, 
  deleteProperty,
  getAllProperties,
  searchProperties,
  toggleFeatureProperty,
  getPropertyDebugInfo
} = require('../controllers/propertyController');
const { protect, host, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/public', getAllProperties);
router.get('/search', searchProperties);
router.get('/debug', getPropertyDebugInfo);

// Protected routes for all users
router.get('/:id', protect, getPropertyById);

// Host routes - Must be authenticated as a host
router.route('/')
  .post(protect, host, createProperty)
  .get(protect, host, getHostProperties);

router.route('/:id')
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Admin routes
router.patch('/:id/feature', protect, admin, toggleFeatureProperty);

module.exports = router; 