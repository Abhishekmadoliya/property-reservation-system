import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FixLocalStorageMismatch = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [userData, setUserData] = useState({
    local: null,
    server: null,
    mismatch: false
  });

  // Check for mismatches between localStorage and server data
  const checkMismatch = async () => {
    try {
      setLoading(true);
      setStatus(null);

      // Get data from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus({
          success: false,
          message: 'You need to be logged in to use this tool'
        });
        setLoading(false);
        return;
      }

      const userString = localStorage.getItem('user');
      const localUser = userString ? JSON.parse(userString) : null;

      // Get data from server
      const response = await axios.get('http://localhost:3000/api/host/application-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const serverData = response.data.data;

      // Check for mismatches
      const hasMismatch = 
        localUser && serverData && 
        (localUser.role !== serverData.role || 
         localUser.hostApplicationStatus !== serverData.applicationStatus);

      setUserData({
        local: localUser,
        server: serverData,
        mismatch: hasMismatch
      });

      setLoading(false);

      if (hasMismatch) {
        setStatus({
          success: false,
          message: 'Mismatch detected between localStorage and server data'
        });
      } else if (localUser && serverData) {
        setStatus({
          success: true,
          message: 'Data is synchronized between localStorage and server'
        });
      }
    } catch (error) {
      console.error('Error checking mismatch:', error);
      setStatus({
        success: false,
        message: error.response?.data?.message || error.message
      });
      setLoading(false);
    }
  };

  // Fix the mismatch by syncing localStorage with server data
  const fixMismatch = async () => {
    try {
      setLoading(true);
      setStatus(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setStatus({
          success: false,
          message: 'You need to be logged in to use this tool'
        });
        setLoading(false);
        return;
      }

      // Get fresh data from server
      const response = await axios.get('http://localhost:3000/api/host/application-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const serverData = response.data.data;
        
        // Get user from localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
          const localUser = JSON.parse(userString);
          
          // Update with server values
          localUser.role = serverData.role;
          localUser.hostApplicationStatus = serverData.applicationStatus;
          
          // Save back to localStorage
          localStorage.setItem('user', JSON.stringify(localUser));
          
          setStatus({
            success: true,
            message: 'Your local data has been synchronized with the server'
          });
          
          // Update state
          setUserData({
            local: localUser,
            server: serverData,
            mismatch: false
          });
        }
      } else {
        setStatus({
          success: false,
          message: response.data.message || 'Failed to get data from server'
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fixing mismatch:', error);
      setStatus({
        success: false,
        message: error.response?.data?.message || error.message
      });
      setLoading(false);
    }
  };

  // Check for mismatches when component mounts
  useEffect(() => {
    checkMismatch();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 my-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Host Role Synchronization</h2>
      
      {status && (
        <div className={`p-4 mb-4 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center">
            {status.success ? 
              <CheckCircle className="h-5 w-5 mr-2" /> : 
              <AlertCircle className="h-5 w-5 mr-2" />
            }
            <p>{status.message}</p>
          </div>
        </div>
      )}

      {userData.mismatch && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Data mismatch detected!</strong> Your browser data doesn't match the server.
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>Local role: <strong>{userData.local?.role || 'unknown'}</strong></li>
                <li>Server role: <strong>{userData.server?.role || 'unknown'}</strong></li>
                <li>Local application status: <strong>{userData.local?.hostApplicationStatus || 'unknown'}</strong></li>
                <li>Server application status: <strong>{userData.server?.applicationStatus || 'unknown'}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={checkMismatch}
          disabled={loading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Check Sync Status
        </button>
        
        <button 
          onClick={fixMismatch}
          disabled={loading || !userData.mismatch}
          className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
            ${userData.mismatch ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Fix Mismatch
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> If you're having trouble accessing host features, this tool will help 
          synchronize your browser data with the server. Click "Fix Mismatch" to update your local data.
        </p>
      </div>
    </div>
  );
};

export default FixLocalStorageMismatch; 