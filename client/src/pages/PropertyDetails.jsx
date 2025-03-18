import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Share, MapPin, Users, Calendar, Check, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(1);
  const [imageErrors, setImageErrors] = useState({});

  const fallbackImage = "https://placehold.co/800x600/e2e8f0/1e293b?text=No+Image+Available";

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/hotels/${id}`);
        
        // Transform API data to match our property structure
        const transformedData = {
          id: response.data._id,
          title: response.data.name,
          location: `${response.data.address}, ${response.data.city}, ${response.data.state}`,
          price: response.data.price,
          rating: response.data.rating,
          description: `Experience a wonderful stay at this property featuring ${response.data.numberOfBedrooms} bedrooms and ${response.data.numberOfBathrooms} bathrooms, perfect for up to ${response.data.numberOfguest} guests.`,
          images: response.data.imageArr || [response.data.image],
          amenities: response.data.ameneties || [],
          host: {
            name: response.data.hostName,
            joinedDate: response.data.hostJoinedOn,
            image: "https://ui-avatars.com/api/?name=" + encodeURIComponent(response.data.hostName)
          },
          details: {
            beds: response.data.numberOfBeds,
            bedrooms: response.data.numberOfBedrooms,
            bathrooms: response.data.numberOfBathrooms,
            maxGuests: response.data.numberOfguest,
            studies: response.data.numberOfStudies
          },
          rules: {
            houseRules: response.data.houseRules || [],
            healthAndSafety: response.data.healthAndSafety || [],
            isCancelable: response.data.isCancelable
          }
        };

        setProperty(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Unable to load property details. Please try again later.');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleImageError = (imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [imageIndex]: true
    }));
  };

  const getImageUrl = (image, index) => {
    return imageErrors[index] ? fallbackImage : image;
  };

  const handleBooking = () => {
    // Implement booking logic here
    console.log('Booking:', { propertyId: id, selectedDates, guests });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
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
      <Navbar />
      
      {/* Back Button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to search</span>
        </button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100">
                <Share size={20} />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100">
                <Heart size={20} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-2xl overflow-hidden">
          <div className="h-[480px]">
            <img 
              src={getImageUrl(property.images[0], 0)} 
              alt="" 
              className="w-full h-full object-cover"
              onError={() => handleImageError(0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="h-[236px]">
                <img 
                  src={getImageUrl(image, index + 1)} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            {/* Host Info */}
            <div className="flex items-center justify-between pb-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Hosted by {property.host.name}</h2>
                <div className="text-gray-500">
                  <p>Host since {property.host.joinedDate}</p>
                </div>
              </div>
              <img src={property.host.image} alt={property.host.name} className="w-16 h-16 rounded-full" />
            </div>

            {/* Property Details */}
            <div className="py-6 border-b">
              <h3 className="text-xl font-semibold mb-4">Property Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
              <h3 className="text-xl font-semibold mb-4">About this place</h3>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-b">
              <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check size={20} className="text-gray-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="py-6 border-b">
              <h3 className="text-xl font-semibold mb-4">House Rules</h3>
              <div className="space-y-3">
                {property.rules.houseRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check size={20} className="text-gray-600" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health & Safety */}
            <div className="py-6">
              <h3 className="text-xl font-semibold mb-4">Health & Safety</h3>
              <div className="space-y-3">
                {property.rules.healthAndSafety.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check size={20} className="text-gray-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="relative">
            <div className="sticky top-8 bg-white rounded-xl border shadow-lg p-6">
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
