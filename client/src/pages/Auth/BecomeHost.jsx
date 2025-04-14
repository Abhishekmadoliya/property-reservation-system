import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Check } from 'lucide-react';
import axios from 'axios';
import BackToHome from '../../components/BackToHome';

const BecomeHost = () => {
  const [formData, setFormData] = useState({
    about: '',
    location: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAlreadyHost, setIsAlreadyHost] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const navigate = useNavigate();

  // Check if user is already a host when component mounts
  useEffect(() => {
    const checkHostStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to become a host');
          setCheckingStatus(false);
          return;
        }
        
        // First check localStorage for faster response
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user.role === 'host') {
            setIsAlreadyHost(true);
            setCheckingStatus(false);
            return;
          }
        }

        // Then verify with the server
        const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.data.role === 'host') {
          setIsAlreadyHost(true);
          
          // Update localStorage if it was out of sync
          if (userInfo) {
            const user = JSON.parse(userInfo);
            user.role = 'host';
            user.hostApplicationStatus = 'approved';
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } catch (err) {
        console.error('Error checking host status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkHostStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to become a host');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'https://property-reservation-system.onrender.com/api/host/apply',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update local user data with new role and host status
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          user.role = 'host';
          user.hostApplicationStatus = 'approved';
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setSuccess(true);
        setLoading(false);
        
        // Redirect to property management after a brief delay
        setTimeout(() => {
          navigate('/host/properties');
        }, 2000);
      }
    } catch (err) {
      console.error('Error applying to become host:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-white">
        <BackToHome />
        <div className="max-w-2xl mx-auto py-8 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your host status...</p>
        </div>
      </div>
    );
  }

  if (isAlreadyHost) {
    return (
      <div className="min-h-screen bg-white">
        <BackToHome />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">You're Already a Host!</h2>
            <p className="text-gray-600 mb-6">
              You already have host privileges and can list properties on our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/host/properties')}
                className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition inline-flex items-center justify-center"
              >
                Manage Your Properties
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition inline-flex items-center justify-center"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackToHome />
      <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Become a Host</h1>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-6">
              You're now a host! You can start listing your properties right away.
            </p>
            <button
              onClick={() => navigate('/host/properties')}
              className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition inline-flex items-center"
            >
              Manage Properties
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8">
              Share your space and start earning immediately. Just fill in a few details and you'll be ready to list your first property.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us about yourself
                </label>
                <textarea
                  id="about"
                  name="about"
                  rows="4"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Share a bit about yourself, your interests, and why you want to become a host."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Where are you located?
                </label>
                <div className="relative">
                  <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us about your hosting experience
                </label>
                <div className="relative">
                  <Calendar className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="">Select your experience</option>
                    <option value="none">I'm new to hosting</option>
                    <option value="some">I've hosted a few times</option>
                    <option value="experienced">I'm an experienced host</option>
                    <option value="professional">I'm a professional property manager</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 text-white rounded-lg font-medium ${
                    loading ? 'bg-gray-400' : 'bg-rose-600 hover:bg-rose-700'
                  } transition-colors duration-300`}
                >
                  {loading ? 'Processing...' : 'Become a Host'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BecomeHost; 