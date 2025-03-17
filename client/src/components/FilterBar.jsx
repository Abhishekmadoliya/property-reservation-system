import React from 'react';
import { Home, Building, Tent, Mountain, Palmtree, Building2 } from 'lucide-react';

function FilterBar({ activeFilter, onFilterChange }) {
  const filters = [
    { icon: Home, label: 'All' },
    { icon: Home, label: 'Houses' },
    { icon: Building, label: 'Apartments' },
    { icon: Tent, label: 'Cabins' },
    { icon: Mountain, label: 'Mountain' },
    { icon: Palmtree, label: 'Beach' },
    { icon: Building2, label: 'City' },
  ];

  return (
    <div className="border-b bg-white w-full">
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 py-4 overflow-x-auto no-scrollbar">
          {filters.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => onFilterChange(label)}
              className={`flex flex-col items-center gap-2 min-w-fit transition
                ${activeFilter === label 
                  ? 'text-rose-500 scale-105' 
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className={`p-3 rounded-full border transition
                ${activeFilter === label 
                  ? 'border-rose-500 bg-rose-50' 
                  : 'hover:border-gray-900'}`}>
                <Icon size={20} />
              </div>
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar