import React from 'react';
import { Search, Menu, User } from 'lucide-react';

function Navbar({ onSearch, searchQuery }) {
  return (
    <nav className="bg-white shadow-sm w-full">
      <div className="w-full px-2 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-rose-500">StayHub</h1>
          </div>

          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="relative max-w-md w-full">
              <div className="flex items-center border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full bg-transparent border-none focus:outline-none"
                />
                <button className="p-2 bg-rose-500 rounded-full text-white">
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full">
              Become a Host
            </button>
            <button className="flex items-center gap-2 border p-2 rounded-full hover:shadow-md transition">
              <Menu size={18} />
              <User size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar