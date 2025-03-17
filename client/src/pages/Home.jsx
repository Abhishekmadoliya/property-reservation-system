import React, { useState } from 'react'
import { Search, MapPin, Calendar, Users, Menu, Heart, Star, Filter } from 'lucide-react';

import PropertyCard from '../components/PropertyCard';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';

const Home = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [properties] = useState([
      {
        id: 1,
        title: "Luxury Beachfront Villa",
        location: "Malibu, California",
        price: 850,
        rating: 4.9,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600",
        type: "Houses"
      },
      {
        id: 2,
        title: "Modern Downtown Loft",
        location: "New York City, NY",
        price: 350,
        rating: 4.7,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600",
        type: "Apartments"
      },
      {
        id: 3,
        title: "Mountain View Cabin",
        location: "Aspen, Colorado",
        price: 450,
        rating: 4.8,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1600",
        type: "Cabins"
      },
      {
        id: 4,
        title: "Oceanfront Beach House",
        location: "Miami Beach, Florida",
        price: 550,
        rating: 4.6,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1600",
        type: "Beach"
      },
      {
        id: 5,
        title: "Downtown Penthouse",
        location: "Chicago, Illinois",
        price: 750,
        rating: 4.9,
        reviews: 112,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1600",
        type: "City"
      }
    ]);
  
    const filteredProperties = properties.filter(property => {
      const matchesFilter = activeFilter === 'All' || property.type === activeFilter;
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
        <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <main className="w-full px-2 sm:px-4 md:px-6 py-6">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
}

export default Home
