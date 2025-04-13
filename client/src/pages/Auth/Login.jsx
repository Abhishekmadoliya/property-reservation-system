import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; // Import Axios
import BackToHome from '../../components/BackToHome';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Show that we're attempting login
      console.log('Attempting login with:', formData);
      
      // Make the API request
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      
      // Log full response for debugging
      console.log('Full response:', response);
      
      // Check if we have a successful response with the correct structure
      if (response.data && response.data.success && response.data.data && response.data.data.token) {
        console.log('Login successful, setting token and redirecting');
        
        // Store the token - note that it's inside response.data.data
        localStorage.setItem('token', response.data.data.token);
        
        // Store user data if available
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        // Navigate to home page
        console.log('Navigating to home page');
        navigate('/');
        return; // Add an explicit return to ensure no further code is executed
      } else {
        // Show response structure for debugging
        console.error('Login response structure:', response.data);
        setError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      // Detailed error logging
      console.error('Login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        setError(error.response.data?.message || 'Login failed. Server error.');
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Server not responding. Please try again later.');
      } else {
        console.error('Error message:', error.message);
        setError('Login failed: ' + error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute top-4 left-4 z-10">
          <BackToHome />
        </div>
        <img 
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1600" 
          alt="Luxury vacation rental" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
          <h1 className="text-white text-4xl font-bold mb-4">Find your perfect stay</h1>
          <p className="text-white/90 text-xl">Discover amazing properties and book your next adventure</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-4">
            <BackToHome />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <h1 className="text-3xl font-bold text-rose-500">StayHub</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Log in to your account</h2>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 focus:ring-4 focus:ring-rose-200 transition-all duration-300 font-medium"
            >
              Sign in
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-rose-500 hover:text-rose-600 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
