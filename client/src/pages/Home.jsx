import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Menu, Heart, Star, Filter } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import PropertyCard from '../components/PropertyCard';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
// import FixLocalStorageMismatch from '../components/FixLocalStorageMismatch';

// Define potential API base URLs to try
const API_URLS = [
  'http://localhost:8765',
  'https://property-reservation-system.onrender.com',
  'http://localhost:3500',
  'http://localhost:5000',
  'http://localhost:8080'
];

// Fallback static data if API is unavailable
const FALLBACK_DATA = [
  {
    _id: "fallback1",
    name: "Seaside Resort",
    category: "Beach",
    image: "https://a0.muscache.com/im/pictures/miso/Hosting-26117817/original/9da40e3c-5846-4359-bb41-05c27b09a8f5.jpeg?im_w=720",
    imageArr: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-578733555164036351/original/fc0129d6-02df-4782-92e9-051a881c67a5.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-578733555164036351/original/694d278e-ff0d-4c08-b549-de3a07313be8.jpeg?im_w=720"
    ],
    address: "123 Beach Road",
    city: "Miami",
    state: "Florida",
    country: "USA",
    price: 2499,
    rating: 4.7,
    numberOfBathrooms: 2,
    numberOfBeds: 3,
    numberOfguest: 6,
    numberOfBedrooms: 2,
    numberOfStudies: 1,
    hostName: "Sarah",
    hostJoinedOn: "January 2020",
    ameneties: ["Kitchen", "Wifi", "Pool", "Beach Access"],
    healthAndSafety: ["Smoke alarm", "Carbon monoxide alarm"],
    houseRules: ["Check-in: 3:00 pm", "Check out: 11:00 am", "No parties"],
    propertyType: "Villa",
    isCancelable: true
  },
  {
    _id: "fallback2",
    name: "Mountain Cabin",
    category: "Mountain",
    image: "https://a0.muscache.com/im/pictures/90d0b224-16e2-41c1-9819-6002749a193e.jpg?im_w=720",
    imageArr: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-53407714/original/f3cf4c09-5419-4f1c-b47c-01987c09b4df.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/c1947f8b-da1e-4800-badf-ed51be3e90da.jpg?im_w=720"
    ],
    address: "45 Pine Trail",
    city: "Aspen",
    state: "Colorado",
    country: "USA",
    price: 1899,
    rating: 4.9,
    numberOfBathrooms: 2,
    numberOfBeds: 4,
    numberOfguest: 8,
    numberOfBedrooms: 3,
    numberOfStudies: 0,
    hostName: "Michael",
    hostJoinedOn: "March 2019",
    ameneties: ["Fireplace", "Wifi", "Heating", "Mountain View"],
    healthAndSafety: ["Smoke alarm", "First aid kit"],
    houseRules: ["Check-in: 4:00 pm", "Check out: 10:00 am", "No smoking"],
    propertyType: "Cabin",
    isCancelable: true
  },
  {
    _id: "fallback3",
    name: "Urban Apartment",
    category: "City",
    image: "https://a0.muscache.com/im/pictures/miso/Hosting-26117817/original/9da40e3c-5846-4359-bb41-05c27b09a8f5.jpeg?im_w=720",
    imageArr: [
      "https://a0.muscache.com/im/pictures/miso/Hosting-578733555164036351/original/fc0129d6-02df-4782-92e9-051a881c67a5.jpeg?im_w=720",
      "https://a0.muscache.com/im/pictures/miso/Hosting-578733555164036351/original/694d278e-ff0d-4c08-b549-de3a07313be8.jpeg?im_w=720"
    ],
    address: "789 Downtown Ave",
    city: "New York",
    state: "New York",
    country: "USA",
    price: 1499,
    rating: 4.5,
    numberOfBathrooms: 1,
    numberOfBeds: 1,
    numberOfguest: 2,
    numberOfBedrooms: 1,
    numberOfStudies: 1,
    hostName: "Emily",
    hostJoinedOn: "June 2021",
    ameneties: ["Wifi", "Kitchen", "Workspace", "Elevator"],
    healthAndSafety: ["Smoke alarm", "Carbon monoxide alarm"],
    houseRules: ["Check-in: 2:00 pm", "Check out: 11:00 am", "No pets"],
    propertyType: "Apartment",
    isCancelable: true
  }
];

const Home = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
      priceRange: [0, 5000],
      propertyType: 'all',
      bedrooms: 'any',
      amenities: []
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
      const fetchProperties = async () => {
        // Try each API URL until one works
        let data = [];
        let lastError = null;
        let foundWorkingApi = false;

        try {
          setLoading(true);

          // First, try to fetch from hotels API
          try {
            console.log('Trying to fetch from hotels API endpoint');
            const response = await axios.get('https://property-reservation-system.onrender.com/api/hotels');
            console.log('Hotels API Response:', response);
            
            if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
              const hotelData = response.data.data;
              console.log('Successfully fetched hotels:', hotelData);
              
              // Transform hotel data
              const transformedHotels = hotelData.map(hotel => ({
                id: hotel._id,
                title: hotel.name,
                formattedLocation: `${hotel.address}, ${hotel.city}, ${hotel.state}`,
                price: hotel.price,
                rating: hotel.rating,
                image: hotel.image,
                imageArr: hotel.imageArr || [],
                type: hotel.propertyType || hotel.category,
                description: `${hotel.numberOfBedrooms} bedrooms · ${hotel.numberOfBathrooms} bathrooms · ${hotel.numberOfguest} guests`,
                amenities: hotel.ameneties || [],
                host: {
                  name: hotel.hostName,
                  joinedDate: hotel.hostJoinedOn
                },
                details: {
                  beds: hotel.numberOfBeds,
                  bedrooms: hotel.numberOfBedrooms,
                  bathrooms: hotel.numberOfBathrooms,
                  maxGuests: hotel.numberOfguest,
                  studies: hotel.numberOfStudies
                },
                rules: {
                  houseRules: hotel.houseRules || [],
                  healthAndSafety: hotel.healthAndSafety || [],
                  isCancelable: hotel.isCancelable
                },
                location: {
                  address: hotel.address,
                  city: hotel.city,
                  state: hotel.state,
                  country: hotel.country
                }
              }));
              
              data = transformedHotels;
              foundWorkingApi = true;
            } else {
              console.log('No hotels found or unexpected response format:', response.data);
              // Continue to properties API
            }
          } catch (err) {
            console.error('Failed to fetch from hotels API:', err.message);
            console.error('Error details:', err.response?.data || err.message);
            // Continue to properties API
          }
          
          // Only try other endpoints if hotels API failed
          if (!foundWorkingApi) {
            // Try to get properties from properties API endpoint
            try {
              console.log('Trying to fetch from properties API endpoint');
              const response = await axios.get('https://property-reservation-system.onrender.com/api/properties/public');
              console.log('Properties API Response:', response);
              
              if (response.data && response.data.success && response.data.properties) {
                // Transform property data
                const newProperties = response.data.properties.map(property => {
                  console.log('Processing property:', property);
                  
                  return {
                    id: property._id,
                    title: property.title,
                    formattedLocation: property.location,
                    price: property.price,
                    rating: 4.8, // Default rating since properties might not have ratings yet
                    image: property.images && property.images.length > 0 ? property.images[0] : 'https://a0.muscache.com/im/pictures/miso/Hosting-26117817/original/9da40e3c-5846-4359-bb41-05c27b09a8f5.jpeg?im_w=720',
                    imageArr: property.images || [],
                    type: property.type || 'Entire home',
                    description: `${property.beds} beds · ${property.baths} baths · ${property.guests} guests`,
                    amenities: property.amenities || [],
                    host: {
                      name: "Host", // We might not have host name in property data
                      joinedDate: "2023"
                    },
                    details: {
                      beds: property.beds,
                      bedrooms: property.beds, // Assuming 1 bed per bedroom
                      bathrooms: property.baths,
                      maxGuests: property.guests,
                      studies: 0
                    },
                    rules: {
                      houseRules: [],
                      healthAndSafety: [],
                      isCancelable: true
                    },
                    location: {
                      address: property.location,
                      city: property.location.split(',')[0] || '',
                      state: property.location.split(',')[1] || '',
                      country: "USA"
                    }
                  };
                });
                
                // Log the transformed properties
                console.log('Transformed properties:', newProperties);
                
                // Use these properties
                data = [...data, ...newProperties]; // Combine with any hotels we found
                foundWorkingApi = true;
                console.log('Successfully fetched properties from new API:', newProperties);
              } else {
                console.log('Property API response was not in expected format:', response.data);
              }
            } catch (err) {
              console.error('Failed to fetch from properties API:', err);
              console.error('Error details:', err.response?.data || err.message);
              // Continue to legacy endpoints
            }
            
            // If no data yet, try legacy endpoints
            if (data.length === 0) {
              // Try each API URL in sequence
              for (const baseUrl of API_URLS) {
                try {
                  console.log(`Trying API endpoint: ${baseUrl}/api/hotels`);
                  const response = await axios.get(`${baseUrl}/api/hotels`);
                  console.log('API Response:', response);
                  
                  // Check if we have data in the expected format
                  if (response.data && (Array.isArray(response.data) || response.data.data)) {
                    // Access the data array from the proper structure
                    const legacyData = Array.isArray(response.data) ? response.data : 
                          (response.data.data || []);
                    
                    console.log(`Successfully connected to: ${baseUrl}`);
                    
                    // Transform the legacy data
                    const transformedLegacy = legacyData.map(hotel => ({
                      id: hotel._id,
                      title: hotel.name,
                      formattedLocation: `${hotel.address}, ${hotel.city}, ${hotel.state}`,
                      price: hotel.price,
                      rating: hotel.rating,
                      image: hotel.image,
                      imageArr: hotel.imageArr || [],
                      type: hotel.propertyType || hotel.category,
                      description: `${hotel.numberOfBedrooms} bedrooms · ${hotel.numberOfBathrooms} bathrooms · ${hotel.numberOfguest} guests`,
                      amenities: hotel.ameneties || [],
                      host: {
                        name: hotel.hostName,
                        joinedDate: hotel.hostJoinedOn
                      },
                      details: {
                        beds: hotel.numberOfBeds,
                        bedrooms: hotel.numberOfBedrooms,
                        bathrooms: hotel.numberOfBathrooms,
                        maxGuests: hotel.numberOfguest,
                        studies: hotel.numberOfStudies
                      },
                      rules: {
                        houseRules: hotel.houseRules || [],
                        healthAndSafety: hotel.healthAndSafety || [],
                        isCancelable: hotel.isCancelable
                      },
                      location: {
                        address: hotel.address,
                        city: hotel.city,
                        state: hotel.state,
                        country: hotel.country
                      }
                    }));
                    
                    data = [...data, ...transformedLegacy];
                    foundWorkingApi = true;
                    break; // Exit the loop if we found a working API
                  }
                } catch (err) {
                  console.log(`API at ${baseUrl} failed:`, err.message);
                  lastError = err;
                  // Continue to the next URL
                }
              }
            }
          }
          
          if (!foundWorkingApi && data.length === 0) {
            console.log('All API endpoints failed, using fallback data');
            
            // Transform fallback data to our common format
            data = FALLBACK_DATA.map(hotel => ({
              id: hotel._id,
              title: hotel.name,
              formattedLocation: `${hotel.address}, ${hotel.city}, ${hotel.state}`,
              price: hotel.price,
              rating: hotel.rating,
              image: hotel.image,
              imageArr: hotel.imageArr || [],
              type: hotel.propertyType || hotel.category,
              description: `${hotel.numberOfBedrooms} bedrooms · ${hotel.numberOfBathrooms} bathrooms · ${hotel.numberOfguest} guests`,
              amenities: hotel.ameneties || [],
              host: {
                name: hotel.hostName,
                joinedDate: hotel.hostJoinedOn
              },
              details: {
                beds: hotel.numberOfBeds,
                bedrooms: hotel.numberOfBedrooms,
                bathrooms: hotel.numberOfBathrooms,
                maxGuests: hotel.numberOfguest,
                studies: hotel.numberOfStudies
              },
              rules: {
                houseRules: hotel.houseRules || [],
                healthAndSafety: hotel.healthAndSafety || [],
                isCancelable: hotel.isCancelable
              },
              location: {
                address: hotel.address,
                city: hotel.city,
                state: hotel.state,
                country: hotel.country
              }
            }));
          }

          console.log(`Final properties for display: ${data.length}`, data);
          setProperties(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching properties:', err);
          setError('Unable to load properties. Please try again later.');
          setProperties([]);
        } finally {
          setLoading(false);
        }
      };

      fetchProperties();
    }, []);
  
    const handleSearch = (query) => {
      setSearchQuery(query);
    };

    const handleFilterChange = (name, value) => {
      setFilters({
        ...filters,
        [name]: value
      });
    };

    const toggleFilters = () => {
      setShowFilters(!showFilters);
    };

    const filteredProperties = properties.filter(property => {
      const matchesFilter = activeFilter === 'All' || property.type === activeFilter;
      const matchesSearch = 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.state?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return (
      <div className="min-h-screen bg-gray-50">
        {/* <FixLocalStorageMismatch /> */}
        <Navbar onSearch={handleSearch} searchQuery={searchQuery} />
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <main className="w-full">
          {/* Hero Section - Mobile First */}
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 py-6 px-4 sm:py-8 sm:px-6 md:py-12 md:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:text-3xl md:text-4xl">
                Find your perfect stay
              </h1>
              <p className="text-base text-gray-700 max-w-2xl sm:text-lg">
                Discover amazing properties for your next adventure, weekend getaway, or business trip.
              </p>
            </div>
          </div>
          
          {/* Filters Section - Mobile First */}
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {filteredProperties.length} Properties Found
              </h2>
              <button 
                onClick={toggleFilters}
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
            
            {/* Responsive Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6`}>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Price Range Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price Range</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        value={filters.priceRange[0]}
                        onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        placeholder="Min"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <input 
                        type="number" 
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                  
                  {/* Property Type Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Type</label>
                    <select 
                      value={filters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  
                  {/* Bedrooms Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <select 
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  {/* Apply Filters Button */}
                  <div className="flex items-end">
                    <button className="w-full px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 text-sm">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Properties Grid - Mobile First */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-pulse">
                    <div className="h-48 sm:h-56 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} className="hover:shadow-md transition-shadow duration-300" />
                ))}
              </div>
            )}
            
            {/* Empty state - Mobile First */}
            {!loading && !error && filteredProperties.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-lg font-medium text-gray-900 sm:text-xl">No properties found</h3>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      priceRange: [0, 5000],
                      propertyType: 'all',
                      bedrooms: 'any',
                      amenities: []
                    });
                  }}
                  className="mt-4 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
}

export default Home;
