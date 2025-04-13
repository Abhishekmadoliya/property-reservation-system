import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is admin, redirect if not
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Host Applications', path: '/admin/host-applications' },
    { name: 'Properties', path: '/admin/properties' },
    { name: 'Users', path: '/admin/users' },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 