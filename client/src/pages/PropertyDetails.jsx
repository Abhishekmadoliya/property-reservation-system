import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Star, Share, MapPin, Users, Calendar, Check, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const PropertyDetails = () => {
  const { id } = useParams();
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(1);

  // Mock data - in a real app, this would come from an API
  const property = {
    id: 1,
    title: "Luxury Beachfront Villa",
    location: "Malibu, California",
    price: 850,
    rating: 4.9,
    reviews: 124,
    description: "Experience luxury living in this stunning beachfront villa. Enjoy breathtaking ocean views, modern amenities, and direct beach access.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1600",
    ],
    amenities: [
      "Beachfront Access",
      "Private Pool",
      "Fully Equipped Kitchen",
      "Free Parking",
      "Wi-Fi",
      "Air Conditioning",
      "24/7 Security",
      "BBQ Area"
    ],
    host: {
      name: "Sarah Johnson",
      rating: 4.8,
      response_rate: 99,
      response_time: "within an hour",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=1600"
    }
  };

  const handleBooking = () => {
    // Implement booking logic here
    console.log('Booking:', { selectedDates, guests });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Back Button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          <span>Back to search</span>
        </button>
      </div>

      <main className="w-full px-4 sm:px-6 lg:px-8 pb-12">
        {/* Property Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star size={20} className="fill-current text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-gray-500">({property.reviews} reviews)</span>
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
            <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {property.images.slice(1).map((image, index) => (
              <div key={index} className="h-[236px]">
                <img src={image} alt="" className="w-full h-full object-cover" />
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
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{property.host.response_rate}% response rate</span>
                  <span>Responds {property.host.response_time}</span>
                </div>
              </div>
              <img src={property.host.image} alt={property.host.name} className="w-16 h-16 rounded-full" />
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
          </div>

          {/* Booking Card */}
          <div className="relative">
            <div className="sticky top-8 bg-white rounded-xl border shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold">${property.price}</span>
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

              <div className="mt-4 text-center text-gray-500">
                <p>You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetails;
