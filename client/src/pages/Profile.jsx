import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackToHome from '../components/BackToHome';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    number: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    // Check token validity first
    checkTokenValidity();
    // Then fetch user profile
    fetchUserProfile();
  }, [navigate]);

  const checkTokenValidity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in to view your profile.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Call debug endpoint to check token
      const response = await axios.get('https://property-reservation-system.onrender.com/api/users/debug-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Token check response:', response.data);
      
      // Token is valid, proceed (fetchUserProfile will handle the actual data)
    } catch (err) {
      console.error('Token validation error:', err);
      
      // If the token is invalid, redirect to login
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Redirecting to login...');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return false;
      }
    }
    
    return true;
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching profile with token:', token);
      const response = await axios.get('https://property-reservation-system.onrender.com/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile data received:', response.data);
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          number: userData.number || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.number?.toString() || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        });
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      
      // If we get an unauthorized error, redirect to login
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Redirecting to login...');
        localStorage.removeItem('token'); // Clear invalid token
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in to update your profile.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Convert the number field to an actual number (backend expects it to be a number)
      // and ensure all required fields are present
      const updateData = {
        username: formData.username,
        email: formData.email,
        number: formData.number ? parseInt(formData.number, 10) : undefined
      };
      
      console.log('Updating profile with data:', updateData);
      
      const response = await axios.put(
        'https://property-reservation-system.onrender.com/api/users/profile',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.data);
        setFormData(prev => ({
          ...prev,
          username: response.data.data.username || '',
          email: response.data.data.email || '',
          number: response.data.data.number || '',
          phone: response.data.data.number?.toString() || ''
        }));
        setIsEditing(false);
        setError('');
        alert('Profile updated successfully!');
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        
        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          setError('Your session has expired. Redirecting to login...');
          localStorage.removeItem('token');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(err.response.data?.message || 'Failed to update profile');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <BackToHome />
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
          {error && (
            <div className="mt-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User Role</label>
                <input
                  type="text"
                  value={user?.role || "user"}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address?.street || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address?.city || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address?.state || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address?.zipCode || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address?.country || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end space-x-0 space-y-2 sm:space-y-0 sm:space-x-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to current user data
                      if (user) {
                        setFormData({
                          username: user.username || '',
                          email: user.email || '',
                          number: user.number || '',
                          phone: user.number?.toString() || '',
                          address: user.address || {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: '',
                            country: ''
                          }
                        });
                      }
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 