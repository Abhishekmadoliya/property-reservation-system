import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

function PropertyCard({ property }) {
  const navigate = useNavigate();
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer w-full" 
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="h-64 w-full object-cover group-hover:scale-105 transition"
        />
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition"
          onClick={(e) => {
            e.stopPropagation();
            // Add favorite logic here
          }}
        >
          <Heart size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
            <p className="text-gray-500">{property.location}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-current text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500">({property.reviews})</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-900">
            <span className="font-semibold">${property.price}</span>
            <span className="text-gray-500"> / night</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard