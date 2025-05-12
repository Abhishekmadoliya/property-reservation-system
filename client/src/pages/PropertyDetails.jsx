import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Share, MapPin, Users, Calendar, Check, ArrowLeft, ThumbsUp, Edit, Trash } from 'lucide-react';
import axios from 'axios';
import BackToHome from '../components/BackToHome';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(1);
  const [imageErrors, setImageErrors] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userHasBooking, setUserHasBooking] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const fallbackImage = "https://placehold.co/800x600/e2e8f0/1e293b?text=No+Image+Available";

  // Load property details and reviews when the page loads
  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      fetchReviews();
    }
  }, [id]);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsUserLoggedIn(!!token);
  }, []);

  // Check if user has booked this property
  const checkUserBooking = async () => {
    if (!isUserLoggedIn) return;
    
    try {
      setCheckingBooking(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://property-reservation-system.onrender.com/api/users/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to check user bookings:', await response.text());
        return;
      }
      
      const data = await response.json();
      
      // Check if user has any booking for this property
      const hasBookedProperty = data.data.some(booking => 
        booking.hotelId === id && ['confirmed', 'completed'].includes(booking.status)
      );
      
      setUserHasBooking(hasBookedProperty);
    } catch (error) {
      console.error('Error checking user bookings:', error);
    } finally {
      setCheckingBooking(false);
    }
  };
  
  // Check if user is logged in and has booked
  useEffect(() => {
    if (isUserLoggedIn && id) {
      checkUserBooking();
    }
  }, [isUserLoggedIn, id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://property-reservation-system.onrender.com/api/hotels/${id}`);
      
      // Check if we have data in the response
      if (!response.data) {
        throw new Error('No data received from the server');
      }
      
      // Access the data properly based on the API response structure
      const hotelData = response.data.data || response.data;
      
      if (!hotelData) {
        throw new Error('Invalid data format received from the server');
      }

      // Transform API data to match our property structure
      const transformedData = {
        id: hotelData._id || id,
        title: hotelData.name || 'Property Details',
        location: `${hotelData.address || ''}, ${hotelData.city || ''}, ${hotelData.state || ''}`,
        price: hotelData.price || 0,
        rating: hotelData.rating || 4.5,
        description: hotelData.description || `Experience a wonderful stay at this property featuring ${hotelData.numberOfBedrooms || 0} bedrooms and ${hotelData.numberOfBathrooms || 0} bathrooms, perfect for up to ${hotelData.numberOfguest || 2} guests.`,
        images: hotelData.imageArr || [hotelData.image] || [],
        amenities: hotelData.ameneties || [],
        host: {
          name: hotelData.hostName || 'Host',
          joinedDate: hotelData.hostJoinedOn || 'Recently',
          image: "https://ui-avatars.com/api/?name=" + encodeURIComponent(hotelData.hostName || 'Host')
        },
        details: {
          beds: hotelData.numberOfBeds || 1,
          bedrooms: hotelData.numberOfBedrooms || 1,
          bathrooms: hotelData.numberOfBathrooms || 1,
          maxGuests: hotelData.numberOfguest || 2,
          studies: hotelData.numberOfStudies || 0
        },
        rules: {
          houseRules: hotelData.houseRules || [],
          healthAndSafety: hotelData.healthAndSafety || [],
          isCancelable: hotelData.isCancelable !== false
        }
      };

      console.log('Transformed property data:', transformedData);
      setProperty(transformedData);
      setError(null);
      
      // Fetch reviews after setting property
      fetchReviews();
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Unable to load property details. Please try again later.');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for this property
  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://property-reservation-system.onrender.com/api/reviews/hotel/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      console.log('Loaded reviews:', data.data);
      
      // Process reviews to ensure all have usernames
      const processedReviews = data.data.map(review => {
        // If no username but has userId, set a default username
        if (!review.username && review.userId) {
          return { ...review, username: "Guest User" };
        }
        return review;
      });
      
      // Check if the current user has already submitted a review
      const userId = getUserIdFromToken();
      if (userId) {
        const userExistingReview = processedReviews.find(review => 
          review.userId === userId
        );
        
        if (userExistingReview) {
          setUserReview({
            id: userExistingReview._id,
            rating: userExistingReview.rating,
            comment: userExistingReview.comment
          });
          setRating(userExistingReview.rating);
          setComment(userExistingReview.comment);
        }
      }
      
      setReviews(processedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };
  
  // Helper function to get user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // For JWT tokens, decode the payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.id || payload.userId || payload._id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Submit a new review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitError(null);
    setReviewSuccess(false);

    if (!isUserLoggedIn) {
      setReviewSubmitError("Please log in to submit a review");
      return;
    }
    
    if (!userHasBooking) {
      setReviewSubmitError("You need to book and stay at this property before leaving a review");
      return;
    }

    try {
      // First verify if user is still authenticated
      const token = localStorage.getItem('token');
      const userResponse = await fetch('https://property-reservation-system.onrender.com/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        setReviewSubmitError("Your login session has expired. Please log in again to submit a review.");
        return;
      }

      const userData = await userResponse.json();
      
      const reviewData = {
        rating: rating,
        comment: comment
      };

      const url = isEditing 
        ? `https://property-reservation-system.onrender.com/api/reviews/${userReview.id}` 
        : `https://property-reservation-system.onrender.com/api/reviews/hotel/${id}`;
      
      const method = isEditing ? 'PUT' : 'POST';

      // Debug log
      console.log('Submitting review request:', {
        url,
        method,
        hotelId: id,
        reviewData,
        isEditing
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      // Debug response
      console.log('Review submission response status:', response.status, response.statusText);

      if (response.status === 401 || response.status === 403) {
        setReviewSubmitError("Your login session has expired. Please log in again to submit a review.");
        return;
      }

      if (!response.ok) {
        // Check content type to handle different error formats
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          // Check for duplicate review error
          if (errorData.message && errorData.message.includes("already reviewed")) {
            setReviewSubmitError("You have already reviewed this property. Please edit your existing review.");
            
            // Refresh reviews to show the existing review
            fetchReviews();
            return;
          }
          throw new Error(errorData.message || 'Failed to submit review');
        } else {
          // Handle non-JSON responses
          const textError = await response.text();
          console.error('Non-JSON error response:', textError);
          throw new Error('Server returned an invalid response. Please try again later.');
        }
      }

      // Reset form
      setRating(5);
      setComment('');
      setUserReview({ rating: 5, comment: '' });
      setIsEditing(false);
      setReviewSuccess(true);
      
      // Fetch updated reviews
      fetchReviews();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Review submission error:', error);
      setReviewSubmitError(error.message || 'An error occurred while submitting your review');
    }
  };

  const handleImageError = (imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [imageIndex]: true
    }));
  };

  const getImageUrl = (image, index) => {
    return imageErrors[index] ? fallbackImage : image;
  };

  const handleBooking = async () => {
    if (!isUserLoggedIn) {
      alert("Please log in to book this property");
      navigate('/login', { state: { from: `/property/${id}` } });
      return;
    }

    // Validate dates
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    // Calculate number of nights
    const checkInDate = new Date(selectedDates.checkIn);
    const checkOutDate = new Date(selectedDates.checkOut);
    
    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      alert("Check-in date cannot be in the past");
      return;
    }
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = property.price * nights;

    try {
      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate('/login', { state: { from: `/property/${id}` } });
        return;
      }

      // Create booking
      const response = await fetch('https://property-reservation-system.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: property.id,
          checkIn: selectedDates.checkIn,
          checkOut: selectedDates.checkOut,
          guests: guests,
          totalPrice: totalPrice
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const data = await response.json();
      
      alert('Booking successful! Thank you for choosing our property.');
      navigate('/bookings'); // Redirect to bookings page
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Booking failed: ${error.message}`);
    }
  };

  // Format date for reviews
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-[480px] bg-gray-200 rounded-2xl mb-8" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  const handleEditReview = (review) => {
    setUserReview({
      id: review._id,
      rating: review.rating,
      comment: review.comment
    });
    setRating(review.rating);
    setComment(review.comment);
    setIsEditing(true);
    
    // Scroll to the review form
    document.getElementById('reviewForm').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://property-reservation-system.onrender.com/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Refresh reviews after deletion
      fetchReviews();
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      setReviewSubmitError('Error deleting review: ' + error.message);
      setTimeout(() => setReviewSubmitError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Property not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <BackToHome />
      </div>

      {error && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded-md">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        </div>
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        {/* Property Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-1">
                <Star size={20} className="fill-current text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={20} className="text-gray-500" />
                <span className="text-gray-500">{property.location}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100">
                <Share size={20} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100">
                <Heart size={20} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="h-[300px] sm:h-[480px]">
            <img 
              src={getImageUrl(property.images[0], 0)} 
              alt="" 
              className="w-full h-full object-cover rounded-lg"
              onError={() => handleImageError(0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="h-[146px] sm:h-[236px]">
                <img 
                  src={getImageUrl(image, index + 1)} 
                  alt="" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => handleImageError(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {/* Host Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">Hosted by {property.host.name}</h2>
                <div className="text-gray-500">
                  <p>Host since {property.host.joinedDate}</p>
                </div>
              </div>
              <img src={property.host.image} alt={property.host.name} className="w-16 h-16 rounded-full" />
            </div>

            {/* Property Details */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-gray-500" />
                  <span>{property.details.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{property.details.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{property.details.beds} beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{property.details.bathrooms} bathrooms</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">About this place</h3>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check size={20} className="text-gray-600" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No amenities listed for this property.</p>
                )}
              </div>
            </div>

            {/* House Rules */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">House Rules</h3>
              <div className="space-y-3">
                {property.rules.houseRules && property.rules.houseRules.length > 0 ? (
                  property.rules.houseRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check size={20} className="text-gray-600" />
                      <span>{rule}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specific house rules provided.</p>
                )}
              </div>
            </div>

            {/* Health & Safety */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Health & Safety</h3>
              <div className="space-y-3">
                {property.rules.healthAndSafety && property.rules.healthAndSafety.length > 0 ? (
                  property.rules.healthAndSafety.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check size={20} className="text-gray-600" />
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No health and safety information provided.</p>
                )}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="py-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold mb-6">Guest Reviews</h3>
              
              {/* Review Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
                <div className="flex items-center">
                  <Star size={24} className="fill-current text-yellow-400" />
                  <span className="text-2xl font-semibold ml-2">{property.rating}</span>
                </div>
                <span className="hidden sm:inline text-gray-500">·</span>
                <span className="text-gray-500">{reviews.length} reviews</span>
              </div>
              
              {/* Review Form for Logged In Users */}
              {isUserLoggedIn && (
                <div id="reviewForm" className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-8">
                  <h4 className="text-base sm:text-lg font-semibold mb-4">
                    {userReview.comment ? 'Edit Your Review' : 'Write a Review'}
                  </h4>
                  
                  {reviewSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                      Your review has been submitted successfully!
                    </div>
                  )}
                  
                  {reviewSubmitError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {reviewSubmitError}
                    </div>
                  )}
                  
                  {checkingBooking ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Checking your booking status...</p>
                    </div>
                  ) : userHasBooking || userReview.id ? (
                    <form onSubmit={handleReviewSubmit} className="w-full px-0 sm:px-4 py-6">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-6 h-6 ${
                                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label
                          htmlFor="comment"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Comment
                        </label>
                        <textarea
                          id="comment"
                          rows="4"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Share your experience with this property..."
                          required
                        ></textarea>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <button
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {isEditing ? 'Update Review' : 'Submit Review'}
                        </button>
                        
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setRating(5);
                              setComment('');
                              setUserReview({ rating: 5, comment: '' });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                      <p>You need to book and stay at this property before leaving a review.</p>
                      <div className="mt-2">
                        <button
                          onClick={() => document.querySelector('.booking-card').scrollIntoView({ behavior: 'smooth' })}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Book now to enable reviews
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Reviews List */}
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((review, index) => {
                    const userInfo = localStorage.getItem('user');
                    const currentUser = userInfo ? JSON.parse(userInfo) : null;
                    const isOwnReview = currentUser && currentUser._id === review.userId;
                    
                    return (
                      <div key={index} className={`border-b border-gray-100 pb-6 last:border-0 ${isOwnReview ? 'bg-rose-50 p-4 rounded-lg' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.username || 'User')}&background=random`} 
                              alt="User" 
                              className="w-12 h-12 rounded-full" 
                            />
                            <div>
                              <h4 className="font-medium">
                                {review.username || 'Anonymous User'}
                                {isOwnReview && <span className="ml-2 text-rose-600 text-sm">(You)</span>}
                              </h4>
                              <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                className={`${i < review.rating ? 'fill-current text-yellow-400' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        
                        {/* Controls for user's own reviews */}
                        {isOwnReview && (
                          <div className="flex gap-4 mt-4 justify-end">
                            <button 
                              onClick={() => handleEditReview(review)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                            >
                              <Trash size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
                  {!isUserLoggedIn && (
                    <button 
                      onClick={() => navigate('/login')}
                      className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
                    >
                      Log in to write a review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:sticky lg:top-8">
            <div className="booking-card bg-white rounded-xl border shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold">₹{property.price}</span>
                <span className="text-gray-500">per night</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 border rounded-lg">
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-3">
                      <label className="block text-sm font-medium text-gray-700">Check-in</label>
                      <input
                        type="date"
                        className="w-full border-0 p-0 focus:ring-0"
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-sm font-medium text-gray-700">Check-out</label>
                      <input
                        type="date"
                        className="w-full border-0 p-0 focus:ring-0"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 border rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700">Guests</label>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      min="1"
                      max={property.details.maxGuests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-20 border-0 p-0 focus:ring-0"
                    />
                    <Users size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition"
              >
                Reserve
              </button>

              {property.rules.isCancelable && (
                <div className="mt-4 text-center text-gray-500">
                  <p>Free cancellation available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;
