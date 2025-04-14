import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Image, MapPin, DollarSign, IndianRupee, Users, CalendarRange, Tag, BedDouble, Bath, Home as HomeIcon, AlertTriangle, Clock, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackToHome from '../../components/BackToHome';
import FixLocalStorageMismatch from '../../components/FixLocalStorageMismatch';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isEditingProperty, setIsEditingProperty] = useState(null);
  const [userIsHost, setUserIsHost] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  // Form state
  const initialFormState = {
    title: '',
    description: '',
    location: '',
    price: '',
    beds: 1,
    baths: 1,
    guests: 1,
    amenities: [],
    images: [],
    type: 'Entire home',
    isAvailable: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Handle image upload
  const handleImageUpload = (e) => {
    // Convert file objects to URL objects
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls]
    });
  };

  // Handle web image URL input
  const [imageUrl, setImageUrl] = useState('');

  const handleAddImageUrl = () => {
    if (imageUrl.trim() !== '') {
      // Basic URL validation
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        setFormData({
          ...formData,
          images: [...formData.images, imageUrl]
        });
        setImageUrl(''); // Clear the input field
      } else {
        setError('Please enter a valid URL starting with http:// or https://');
      }
    }
  };

  // Helper function to show debug info
  const showDebugInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      const user = userInfo ? JSON.parse(userInfo) : null;
      
      // Get fresh data from server
      let serverData = null;
      if (token) {
        try {
          const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          serverData = response.data;
        } catch (err) {
          console.error("Error fetching server data:", err);
          serverData = { error: err.message, response: err.response?.data };
        }
      }
      
      setDebugInfo({
        hasToken: !!token,
        localUserInfo: user,
        serverData,
        applicationStatus,
        userIsHost,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      setDebugInfo({
        error: e.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Check user's host status directly from the API
  const checkHostStatusFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to access this page');
        setLoading(false);
        return false;
      }

      const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { role } = response.data.data;
        
        // Update user info in localStorage to keep it in sync
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          user.role = role;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        if (role === 'host') {
          setUserIsHost(true);
          fetchProperties();
          return true;
        } else {
          setError('You need to be approved as a host to manage properties');
          setLoading(false);
          return false;
        }
      } else {
        throw new Error(response.data.message || 'Failed to check host status');
      }
    } catch (err) {
      console.error('Error checking host status:', err);
      
      // Fall back to checking localStorage if API request fails
      return checkUserRoleFromLocalStorage();
    }
  };

  // Check if user is logged in and has host role from localStorage (fallback)
  const checkUserRoleFromLocalStorage = () => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (!token) {
      setError('You must be logged in to access this page');
      setLoading(false);
      return false;
    }
    
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log("User data from localStorage:", user);
        
        if (user.role === 'host') {
          setUserIsHost(true);
          fetchProperties();
          return true;
        } else {
          setError('You need to be a host to manage properties. Apply to become a host first.');
          setLoading(false);
          return false;
        }
      } catch (e) {
        console.error('Error parsing user info', e);
        setError('Error reading user information: ' + e.message);
        setLoading(false);
        return false;
      }
    } else {
      setError('User information not found');
      setLoading(false);
      return false;
    }
  };

  // Check if user is logged in and has host role
  useEffect(() => {
    checkHostStatusFromAPI();
  }, []);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      await verifyHostStatus();
      
      const token = localStorage.getItem('token');
      const response = await axios.get('https://property-reservation-system.onrender.com/api/hotels', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter hotels that belong to the current host
      const hostHotels = response.data.data.filter(hotel => 
        hotel.hostName === JSON.parse(localStorage.getItem('user')).username
      );
      
      // Format properties for the UI
      const formattedProperties = hostHotels.map(hotel => ({
        _id: hotel._id,
        title: hotel.name,
        description: `${hotel.propertyType} in ${hotel.city}, ${hotel.state}`,
        location: `${hotel.address}, ${hotel.city}, ${hotel.state}`,
        price: hotel.price,
        beds: hotel.numberOfBeds,
        baths: hotel.numberOfBathrooms,
        guests: hotel.numberOfguest,
        amenities: hotel.ameneties,
        images: hotel.imageArr,
        type: hotel.propertyType,
        isAvailable: true
      }));

      setProperties(formattedProperties || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      
      // Check if it's a 403 Forbidden error
      if (err.response && err.response.status === 403) {
        // Get application status from error response if available
        if (err.response.data && err.response.data.isPending) {
          setApplicationStatus('pending');
        }
        
        // Try to get the detailed error message from the response
        const errorMessage = err.response.data?.message || 
          'You do not have permission to manage properties. You may need to be approved as a host first.';
        setError(errorMessage);
      } else {
        setError('Failed to load properties. Please try again.');
      }
      
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  // Handle amenities selection
  const handleAmenityToggle = (amenity) => {
    const currentAmenities = [...formData.amenities];
    if (currentAmenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: currentAmenities.filter(item => item !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...currentAmenities, amenity]
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        return;
      }
      
      // Get user info for host data
      const userInfo = localStorage.getItem('user');
      const user = userInfo ? JSON.parse(userInfo) : null;
      const username = user?.username || 'Host';
      
      // Validate required fields
      if (!formData.title.trim()) {
        setError("Property name is required");
        return;
      }
      
      if (!formData.price || isNaN(parseInt(formData.price))) {
        setError("Valid price is required");
        return;
      }
      
      if (!formData.location.trim()) {
        setError("Location is required");
        return;
      }
      
      // Parse location into components (as best we can)
      const locationParts = formData.location.split(',').map(part => part.trim());
      let address = locationParts[0] || '';
      let city = locationParts[0] || '';
      // Ensure state is never empty
      let state = locationParts.length > 1 ? locationParts[1] : 'Unknown';
      
      // If state is still empty, provide a default value
      if (!state || state.trim() === '') {
        state = 'Unknown';
      }
      
      // Transform property data to match hotel model
      const hotelData = {
        // Basic info - these are the required fields
        name: formData.title.trim(),
        description: formData.description.trim() || 'Beautiful property for rent',
        address: address,
        city: city,
        state: state, // This is now guaranteed to have a value
        country: "USA",
        
        // Property details - ensure all numbers are valid
        price: parseInt(formData.price) || 0,
        numberOfBathrooms: parseInt(formData.baths) || 1,
        numberOfBeds: parseInt(formData.beds) || 1,
        numberOfguest: parseInt(formData.guests) || 1,
        numberOfBedrooms: parseInt(formData.beds) || 1, // Using beds as bedrooms
        numberOfStudies: 0,
        
        // Categories and types
        category: formData.type,
        propertyType: formData.type,
        
        // Images - ensure at least one default image
        image: formData.images.length > 0 ? formData.images[0] : 'https://a0.muscache.com/im/pictures/miso/Hosting-26117817/original/9da40e3c-5846-4359-bb41-05c27b09a8f5.jpeg?im_w=720',
        imageArr: formData.images,
        
        // Host information
        hostName: username,
        hostJoinedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        
        // Amenities and rules - ensure arrays
        ameneties: Array.isArray(formData.amenities) ? formData.amenities : [],
        healthAndSafety: ["Smoke alarm", "Carbon monoxide alarm"],
        houseRules: ["Check-in: 3:00 pm", "Check out: 11:00 am"],
        
        // Availability
        isAvailable: Boolean(formData.isAvailable),
        isCancelable: true,
        
        // Rating - always provide a default
        rating: 4.5
      };
      
      console.log('Submitting hotel data:', hotelData);
      
      let response;
      if (isEditingProperty) {
        response = await axios.put(`https://property-reservation-system.onrender.com/api/hotels/${isEditingProperty}`, hotelData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await axios.post('https://property-reservation-system.onrender.com/api/hotels', hotelData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('Server response:', response.data);
      
      // Reset form and states
      setFormData(initialFormState);
      setIsAddingProperty(false);
      setIsEditingProperty(null);
      
      // Refresh property list
      fetchProperties();
    } catch (err) {
      console.error('Error saving property:', err);
      
      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      }
      
      // Show detailed error message if available
      if (err.response && err.response.data) {
        if (err.response.data.error && err.response.data.error.includes('validation failed')) {
          // Handle specific validation errors
          const errorMessage = err.response.data.error;
          const fieldMatch = errorMessage.match(/Path `([^`]+)` is required/);
          if (fieldMatch && fieldMatch[1]) {
            setError(`The field "${fieldMatch[1]}" is required. Please fill it in.`);
          } else {
            setError(`Validation error: ${errorMessage}`);
          }
        } else if (err.response.data.error === "ValidationError" || err.response.status === 400) {
          // Handle general validation errors
          setError(`Validation error: ${err.response.data.message || 'Please check all required fields.'}`);
        } else {
          setError(err.response.data.message || 
                 (err.response.data.error ? `Server error: ${err.response.data.error}` : 
                 'Server error occurred. Please try again later.'));
        }
      } else {
        setError('Could not connect to the server. Please check your internet connection and try again.');
      }
    }
  };

  // Handle property edit
  const handleEdit = (property) => {
    setFormData({
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      beds: property.beds || 1,
      baths: property.baths || 1,
      guests: property.guests || 1,
      amenities: property.amenities || [],
      images: property.images || [],
      type: property.type || 'Entire home',
      isAvailable: true, // Hotels are always available
    });
    setIsEditingProperty(property._id);
    setIsAddingProperty(true);
    window.scrollTo(0, 0);
  };

  // Handle property delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://property-reservation-system.onrender.com/api/hotels/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Refresh property list
        fetchProperties();
      } catch (err) {
        console.error('Error deleting property:', err);
        setError('Failed to delete property. Please try again.');
      }
    }
  };

  // Available amenities for selection
  const availableAmenities = [
    'WiFi', 'Kitchen', 'Free parking', 'Pool', 'Hot tub', 
    'Washer', 'Dryer', 'Air conditioning', 'Heating', 'TV',
    'Workspace', 'Gym', 'Breakfast', 'Beachfront', 'Ski-in/Ski-out'
  ];

  // Property types
  const propertyTypes = [
    'Entire home', 'Private room', 'Shared room', 'Hotel', 'Unique space'
  ];

  // Reset form and close add/edit mode
  const handleCancel = () => {
    setFormData(initialFormState);
    setIsAddingProperty(false);
    setIsEditingProperty(null);
  };

  // Handle navigation to become host page
  const goToBecomeHost = () => {
    navigate('/become-host');
  };

  // Handle refresh status
  const refreshStatus = () => {
    setLoading(true);
    checkHostStatusFromAPI();
  };

  // Add an enhanced function to force sync from the server
  const forceSync = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to access this page');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { role, applicationStatus } = response.data.data;
        
        // Update user info in localStorage
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          
          // Update with values from server
          user.role = role;
          user.hostApplicationStatus = applicationStatus;
          
          // Save back to localStorage
          localStorage.setItem('user', JSON.stringify(user));
          
          // Set local state
          setApplicationStatus(applicationStatus);
          
          if (role === 'host') {
            setUserIsHost(true);
            fetchProperties();
          } else {
            setUserIsHost(false);
            setError(`Your role is '${role}' and host application status is '${applicationStatus}'`);
            setLoading(false);
          }
        }
      } else {
        setError('Failed to retrieve user information from server');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error syncing data:', err);
      setError('Failed to sync with server: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Verify host status again before showing dashboard
  const verifyHostStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return false;
      }
      
      const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // ... rest of the function ...
    } catch (error) {
      // ... error handling ...
      return false;
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackToHome />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackToHome />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="w-full mb-6">
              <FixLocalStorageMismatch />
            </div>
            
            {!userIsHost && (
              <div className="space-y-4 w-full">
                <p className="text-gray-700">
                  To list properties on our platform, you need to be a host.
                </p>
                <button 
                  onClick={goToBecomeHost}
                  className="w-full px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                >
                  Apply to Become a Host
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Return to Home
                </button>
              </div>
            )}
            
            {userIsHost && (
              <div className="space-y-4 w-full">
                <p className="text-gray-700">
                  You are a host, but there seems to be an issue accessing your properties.
                </p>
                <button 
                  onClick={fetchProperties}
                  className="w-full px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Return to Home
                </button>
              </div>
            )}
            
            {/* Debug section for troubleshooting */}
            <div className="mt-8 pt-6 border-t border-gray-200 w-full">
              <button 
                onClick={showDebugInfo}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw size={16} />
                Show Debug Info
              </button>
              
              {debugInfo && (
                <div className="mt-4 bg-gray-50 p-4 rounded text-left overflow-auto max-h-64 text-xs">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Add a clear section explaining potential issues */}
            <div className="mt-8 pt-6 border-t border-gray-200 w-full">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Still having trouble?</h3>
                <p className="text-xs text-blue-700 mt-1">
                  If you've just become a host, your browser may be using outdated information.
                  Click the button below to sync your account status.
                </p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={forceSync}
                    className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    <RefreshCw size={16} />
                    Force Sync with Server
                  </button>
                  <button 
                    onClick={() => navigate('/host/application-status')}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    <Info size={16} />
                    Advanced Diagnostics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackToHome />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Your Properties</h1>
          {!isAddingProperty && (
            <button
              onClick={() => setIsAddingProperty(true)}
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
            >
              <PlusCircle size={20} />
              <span>Add New Property</span>
            </button>
          )}
        </div>

        {/* Add/Edit Property Form */}
        {isAddingProperty && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              {isEditingProperty ? 'Edit Property' : 'Add New Property'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Cozy beach house with ocean view"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Miami Beach, Florida"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
              
              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per night (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    placeholder="100"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleNumberChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Baths
                  </label>
                  <input
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleNumberChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleNumberChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
              
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Availability Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="h-5 w-5 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Make this property visible to guests (list on the website)
                  </span>
                </label>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your property in detail. What makes it special? What can guests expect?"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                ></textarea>
              </div>
              
              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableAmenities.map(amenity => (
                    <div 
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                        formData.amenities.includes(amenity) 
                          ? 'bg-rose-100 border-rose-500 text-rose-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => {}}
                        className="h-4 w-4 text-rose-600"
                      />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                
                {/* Image Upload Options */}
                <div className="space-y-4">
                  {/* From PC */}
                  <div className="mt-1 flex items-center">
                    <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer w-full sm:w-auto">
                      <Image className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Upload from PC</span>
                      <input type="file" className="hidden" multiple onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                  
                  {/* From Web URL */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder="Enter image URL (https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-md hover:bg-rose-200 transition"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img src={image} alt="Property" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index)
                          })}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition w-full sm:w-auto"
                >
                  {isEditingProperty ? 'Update Property' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {properties.map(property => (
              <div key={property._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                {/* Property Image */}
                <div className="aspect-video relative">
                  {property.images && property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <HomeIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(property)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-rose-600 font-semibold">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      
                      <span>{property.price}</span>
                      <span className="text-gray-500 text-sm ml-1">night</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="text-sm flex items-center">
                      <BedDouble className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{property.beds || 1} {property.beds === 1 ? 'bed' : 'beds'}</span>
                    </div>
                    <div className="text-sm flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{property.baths || 1} {property.baths === 1 ? 'bath' : 'baths'}</span>
                    </div>
                    <div className="text-sm flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{property.guests || 1} {property.guests === 1 ? 'guest' : 'guests'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-3">
                    {property.amenities?.slice(0, 3).map(amenity => (
                      <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {property.amenities?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {property.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No properties yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first rental property
            </p>
            <button
              onClick={() => setIsAddingProperty(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition w-full sm:w-auto"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              <span>Add New Property</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement; 