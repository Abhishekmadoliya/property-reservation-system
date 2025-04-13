import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Globe, ChevronDown, Heart } from 'lucide-react';

const Navbar = ({ onSearch, searchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); // Check if user is logged in

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(e.target.value);
  };

  const handleBecomeHost = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/become-host');
    }
  };

  return (
    <nav className="bg-white border-b w-full shadow-sm sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:hidden"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
            <Link to="/" className="ml-2 sm:ml-0 text-xl sm:text-2xl font-bold text-rose-600">
              Property Reservation System
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-rose-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="Search for unique stays..."
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Desktop Menu Items */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBecomeHost}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-rose-600 bg-rose-50 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Become a Host
              </button>

              <button className="flex items-center p-2 text-gray-400 hover:text-gray-500">
                <Globe className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center p-2 text-gray-400 hover:text-gray-500"
                    >
                      <User className="h-5 w-5" />
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" /> Profile
                        </Link>
                        <Link
                          to="/bookings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-2" /> My Bookings
                        </Link>
                        <button
                          onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/');
                            setIsUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="mobile-search"
                  name="mobile-search"
                  className="block w-full pl-10 pr-3 py-2 border border-rose-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="Search for unique stays..."
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={() => {
                  handleBecomeHost();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Become a Host
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/bookings"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;