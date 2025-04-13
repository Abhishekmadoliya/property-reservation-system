import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Home, BookOpen, LogOut, Settings, PlusCircle, LayoutDashboard, Building } from 'lucide-react';

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (token) {
      setIsLoggedIn(true);
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setUserRole(user.role || 'user');
        } catch (e) {
          console.error('Error parsing user info', e);
        }
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]); // Re-check when route changes

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole('user');
    // Close the menu
    setIsOpen(false);
    // Redirect to home
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" />, showWhen: 'always' },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" />, showWhen: 'loggedIn' },
    { name: 'My Bookings', path: '/bookings', icon: <BookOpen className="w-5 h-5" />, showWhen: 'loggedIn' },
    { name: 'Become a Host', path: '/become-host', icon: <PlusCircle className="w-5 h-5" />, showWhen: 'regularUser' },
    { name: 'Manage Properties', path: '/host/properties', icon: <Building className="w-5 h-5" />, showWhen: 'host' },
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, showWhen: 'admin' },
    { name: 'Host Applications', path: '/admin/host-applications', icon: <Settings className="w-5 h-5" />, showWhen: 'admin' },
    { name: 'Login', path: '/login', icon: <User className="w-5 h-5" />, showWhen: 'loggedOut' },
    { name: 'Register', path: '/register', icon: <PlusCircle className="w-5 h-5" />, showWhen: 'loggedOut' }
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.showWhen === 'always') return true;
    if (link.showWhen === 'loggedIn' && isLoggedIn) return true;
    if (link.showWhen === 'loggedOut' && !isLoggedIn) return true;
    if (link.showWhen === 'admin' && userRole === 'admin') return true;
    if (link.showWhen === 'host' && userRole === 'host') return true;
    if (link.showWhen === 'regularUser' && isLoggedIn && userRole !== 'host') return true;
    return false;
  });

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 sm:bottom-10 md:bottom-12 lg:bottom-12">
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="flex items-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="font-medium">Menu</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-2 border border-gray-200 max-h-[70vh] overflow-y-auto sm:bottom-16">
            <div className="flex flex-col space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100 ${
                    location.pathname === link.path ? 'bg-rose-100 text-rose-700' : 'text-gray-700'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavMenu; 