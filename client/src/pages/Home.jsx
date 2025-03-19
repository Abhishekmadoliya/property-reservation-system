import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Menu, Heart, Star, Filter } from 'lucide-react';
import axios from 'axios';

import PropertyCard from '../components/PropertyCard';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';

// Define potential API base URLs to try
const API_URLS = [
  'http://localhost:8765',
  'http://localhost:3000',
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

    useEffect(() => {
      const fetchProperties = async () => {
        // Try each API URL until one works
        let data = [];
        let lastError = null;
        let foundWorkingApi = false;

        try {
          setLoading(true);
          
          // Try each API URL in sequence
          for (const baseUrl of API_URLS) {
            try {
              console.log(`Trying API endpoint: ${baseUrl}/api/hotels`);
              const response = await axios.get(`${baseUrl}/api/hotels`);
              console.log('API Response:', response);
              
              // Check if we have data in the expected format
              if (response.data && (Array.isArray(response.data) || response.data.data)) {
                // Access the data array from the proper structure
                data = Array.isArray(response.data) ? response.data : 
                      (response.data.data || []);
                
                console.log(`Successfully connected to: ${baseUrl}`);
                foundWorkingApi = true;
                break; // Exit the loop if we found a working API
              }
            } catch (err) {
              console.log(`API at ${baseUrl} failed:`, err.message);
              lastError = err;
              // Continue to the next URL
            }
          }
          
          if (!foundWorkingApi) {
            console.log('All API endpoints failed, using fallback data');
            data = FALLBACK_DATA;
          }
          
          const transformedData = data.map(hotel => ({
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

          setProperties(transformedData);
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
  
    const filteredProperties = properties.filter(property => {
      const matchesFilter = activeFilter === 'All' || property.type === activeFilter;
      const matchesSearch = 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.state?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Loading skeleton component
    const LoadingSkeleton = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 animate-pulse">
            <div className="h-72 bg-gray-200" />
            <div className="p-5 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-rose-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No properties match your search "${searchQuery}"`
                    : activeFilter !== 'All'
                    ? `No properties available in the "${activeFilter}" category`
                    : 'No properties are currently available'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
                </h2>
                <p className="text-gray-500 mt-1">
                  {activeFilter !== 'All' ? `Showing ${activeFilter} properties` : 'Showing all properties'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    );
}

export default Home;
