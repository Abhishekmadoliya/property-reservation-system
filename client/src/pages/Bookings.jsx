import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Check, X, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import BackToHome from '../components/BackToHome';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login', { state: { from: '/bookings' } });
          return;
        }
        
        const response = await fetch('http://localhost:3000/api/users/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        setBookings(data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Unable to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate nights from dates
  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      // Refresh bookings list
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(`Failed to cancel booking: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackToHome />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your property bookings</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <div className="mb-4">
              <Calendar size={48} className="mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-2 text-gray-500">
              You haven't made any bookings yet.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Explore Properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white shadow overflow-hidden rounded-lg">
                {/* Booking Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <span 
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusBadge(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      Booking #{booking._id.substr(-8)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Booked on</p>
                    <p className="text-sm font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
                
                {/* Booking Details */}
                <div className="px-6 py-4">
                  {booking.hotel ? (
                    <div className="flex flex-col md:flex-row">
                      {/* Property Image */}
                      <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6">
                        <div className="h-48 overflow-hidden rounded">
                          <img 
                            src={booking.hotel.image || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image"} 
                            alt={booking.hotel.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">
                          <Link to={`/property/${booking.hotelId}`} className="text-indigo-600 hover:text-indigo-800">
                            {booking.hotel.name}
                          </Link>
                        </h4>
                        
                        <div className="flex items-center gap-1 text-gray-600 mb-4">
                          <MapPin size={16} />
                          <span>{booking.hotel.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Check-in</p>
                            <p className="font-medium">{formatDate(booking.checkIn)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Check-out</p>
                            <p className="font-medium">{formatDate(booking.checkOut)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Guests</p>
                            <p className="font-medium flex items-center gap-1">
                              <Users size={16} />
                              {booking.guests}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium">
                              {calculateNights(booking.checkIn, booking.checkOut)} {calculateNights(booking.checkIn, booking.checkOut) === 1 ? 'night' : 'nights'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t pt-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Price</p>
                            <p className="text-xl font-bold">₹{booking.totalPrice}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                              >
                                <X size={16} className="mr-1" />
                                Cancel
                              </button>
                            )}
                            
                            <Link
                              to={`/property/${booking.hotelId}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View Property
                            </Link>
                            
                            {(booking.status === 'completed' || booking.status === 'confirmed') && (
                              <Link
                                to={`/property/${booking.hotelId}#reviewForm`}
                                className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded text-indigo-700 bg-white hover:bg-indigo-50"
                              >
                                <Check size={16} className="mr-1" />
                                {booking.status === 'completed' ? 'Write Review' : 'Manage Booking'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Property details not available</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings; 