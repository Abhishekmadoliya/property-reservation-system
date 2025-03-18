import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Menu, Heart, Star, Filter } from 'lucide-react';
import axios from 'axios';

import PropertyCard from '../components/PropertyCard';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';

const Home = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchProperties = async () => {
        try {
          setLoading(true);
          const response = await axios.get('http://localhost:3000/api/hotels');
          
          // Transform API data to match our property structure
          const transformedData = response.data.map(hotel => ({
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
