import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackToHome from '../../components/BackToHome';
import { Clock, RefreshCw, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';

const ApplicationTester = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActionStatus({
          success: false,
          message: 'You must be logged in to use this tool'
        });
        setLoading(false);
        return;
      }

      // Get user data from local storage
      const userInfoString = localStorage.getItem('user');
      const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
      
      // Get fresh data from server
      const response = await axios.get('https://property-reservation-system.onrender.com/api/host/application-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Get detailed debug information
      const debugResponse = await axios.get('https://property-reservation-system.onrender.com/api/host/debug-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUserData({
        localStorageData: userInfo,
        serverData: response.data.data,
        debugData: debugResponse.data.data
      });
      
      setServerResponse({
        standardResponse: response.data,
        debugResponse: debugResponse.data
      });

      // Check if current user is admin
      if (userInfo && userInfo.role === 'admin') {
        setIsAdmin(true);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking user status:', err);
      setActionStatus({
        success: false,
        message: err.response?.data?.message || err.message
      });
      setLoading(false);
    }
  };

  const syncLocalStorage = () => {
    try {
      if (userData?.serverData) {
        const userInfoString = localStorage.getItem('user');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          
          // Update with server values
          userInfo.role = userData.serverData.role;
          userInfo.hostApplicationStatus = userData.serverData.applicationStatus;
          
          // Save back to localStorage
          localStorage.setItem('user', JSON.stringify(userInfo));
          
          setActionStatus({
            success: true,
            message: 'Local storage data synchronized with server data'
          });
          
          // Refresh to see changes
          checkUserStatus();
        }
      }
    } catch (e) {
      setActionStatus({
        success: false,
        message: `Error syncing data: ${e.message}`
      });
    }
  };

  const resetApplicationStatus = async () => {
    try {
      setActionStatus({
        success: true,
        message: 'This would reset your application status on the server (not implemented yet)'
      });
    } catch (err) {
      setActionStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    }
  };

  const approveApplication = async () => {
    try {
      setActionStatus(null);
      if (!userData?.debugData?.id) {
        setActionStatus({
          success: false,
          message: 'User ID not found'
        });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://property-reservation-system.onrender.com/api/host/process-application',
        {
          userId: userData.debugData.id,
          status: 'approved'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setActionStatus({
          success: true,
          message: 'Application approved successfully! Please refresh to see changes.'
        });
        // Refresh data
        setTimeout(checkUserStatus, 1000);
      } else {
        setActionStatus({
          success: false,
          message: response.data.message || 'Error processing application'
        });
      }
    } catch (err) {
      console.error('Error approving application:', err);
      setActionStatus({
        success: false,
        message: err.response?.data?.message || err.message
      });
    }
  };

  const renderStatusIndicator = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-5 h-5 mr-1" />
            <span>Pending</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="w-5 h-5 mr-1" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <Info className="w-5 h-5 mr-1" />
            <span>{status || 'Unknown'}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <BackToHome />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackToHome />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Host Application Diagnostics</h1>
          
          {actionStatus && (
            <div className={`p-4 mb-6 rounded-lg ${actionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {actionStatus.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Local Storage Data</h2>
              {userData?.localStorageData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{userData.localStorageData.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Role:</span>
                    <span className="font-medium">{userData.localStorageData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Status:</span>
                    {renderStatusIndicator(userData.localStorageData.hostApplicationStatus)}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No user data found in local storage</p>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Server Data</h2>
              {userData?.serverData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Role:</span>
                    <span className="font-medium">{userData.serverData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application Status:</span>
                    {renderStatusIndicator(userData.serverData.applicationStatus)}
                  </div>
                  {userData.serverData.applicationDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application Date:</span>
                      <span className="font-medium">
                        {new Date(userData.serverData.applicationDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No user data received from server</p>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <h2 className="text-lg font-semibold">Data Discrepancy Analysis</h2>
            {userData?.localStorageData && userData?.serverData ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                {userData.localStorageData.role !== userData.serverData.role ? (
                  <div className="mb-2 text-blue-800">
                    <strong>Role mismatch detected!</strong> Local: {userData.localStorageData.role}, Server: {userData.serverData.role}
                  </div>
                ) : null}
                
                {userData.localStorageData.hostApplicationStatus !== userData.serverData.applicationStatus ? (
                  <div className="mb-2 text-blue-800">
                    <strong>Application status mismatch detected!</strong> Local: {userData.localStorageData.hostApplicationStatus}, Server: {userData.serverData.applicationStatus}
                  </div>
                ) : null}
                
                {userData.localStorageData.role === userData.serverData.role &&
                 userData.localStorageData.hostApplicationStatus === userData.serverData.applicationStatus ? (
                  <div className="text-green-800">
                    <strong>Data is in sync.</strong> Local storage matches server data.
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-gray-500 italic">Cannot compare data</p>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Actions</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={checkUserStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
              
              <button 
                onClick={syncLocalStorage}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                disabled={!userData?.serverData}
              >
                Sync Local Storage with Server
              </button>
              
              <button 
                onClick={() => navigate('/host/properties')}
                className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition"
              >
                Go to Property Management
              </button>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Debug Information</h2>
            {userData?.debugData ? (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg overflow-auto max-h-48 sm:max-h-64">
                <h3 className="text-md font-medium">User Schema Fields</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.debugData.userSchema.map(field => (
                    <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {field}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-md font-medium">Host Information</h3>
                {userData.debugData.hostInfo ? (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <pre className="text-xs">
                      {JSON.stringify(userData.debugData.hostInfo, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No host information available</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No debug data available</p>
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Raw Server Response</h2>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
              <pre className="text-xs">
                {JSON.stringify(serverResponse, null, 2)}
              </pre>
            </div>
          </div>

          {isAdmin && userData?.debugData?.hostApplicationStatus === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-md font-semibold text-yellow-800 mb-2">Admin Actions</h3>
              <p className="text-sm text-yellow-700 mb-3">
                As an admin, you can approve this pending host application directly:
              </p>
              <button
                onClick={approveApplication}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Approve Host Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTester; 