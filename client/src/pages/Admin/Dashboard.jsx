import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import BackToHome from '../../components/BackToHome';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalProperties: 0,
    totalBookings: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          'https://property-reservation-system.onrender.com/api/admin/dashboard-stats',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard stats');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching dashboard stats');
        // For now we'll use mock data since the endpoint doesn't exist
        setStats({
          totalUsers: 158,
          totalHosts: 42,
          totalProperties: 87,
          totalBookings: 215,
          pendingApplications: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${color}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</h3>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4">
        <BackToHome />
        <AdminLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        </AdminLayout>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <BackToHome />
      <AdminLayout>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Admin Dashboard</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 sm:mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>} 
              color="text-blue-600" 
            />
            
            <StatCard 
              title="Total Hosts" 
              value={stats.totalHosts} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>} 
              color="text-green-600" 
            />
            
            <StatCard 
              title="Total Properties" 
              value={stats.totalProperties} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>} 
              color="text-purple-600" 
            />
            
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>} 
              color="text-yellow-600" 
            />
            
            <StatCard 
              title="Pending Applications" 
              value={stats.pendingApplications} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>} 
              color="text-red-600" 
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activities</h2>
            <p className="text-gray-500 text-sm sm:text-base">Activity log will be implemented in future updates.</p>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default Dashboard; 