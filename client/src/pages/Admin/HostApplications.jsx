import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import BackToHome from '../../components/BackToHome';

const HostApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          'http://localhost:3000/api/host/applications',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setApplications(response.data.data.applications);
        } else {
          setError(response.data.message || 'Failed to fetch applications');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const handleProcessApplication = async (userId, status) => {
    setProcessingId(userId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/host/process-application',
        { userId, status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the local state to reflect the change
        setApplications(applications.map(app => 
          app.userId === userId 
            ? { ...app, applicationStatus: status } 
            : app
        ));
        alert(`Application ${status} successfully`);
      } else {
        setError(response.data.message || `Failed to ${status} application`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while processing the application');
    } finally {
      setProcessingId(null);
    }
  };

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
    <div className="p-4">
      <BackToHome />
      <AdminLayout>
        <div className="max-w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Host Applications</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {applications.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-10 rounded-md text-center">
              No pending host applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      About
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.username}</div>
                            <div className="text-sm text-gray-500">{application.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(application.applicationDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{application.hostInfo.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{application.hostInfo.experience}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                          {application.hostInfo.about}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {application.applicationStatus === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleProcessApplication(application.userId, 'approved')}
                              disabled={processingId === application.userId}
                              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md disabled:opacity-50"
                            >
                              {processingId === application.userId ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleProcessApplication(application.userId, 'rejected')}
                              disabled={processingId === application.userId}
                              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md disabled:opacity-50"
                            >
                              {processingId === application.userId ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            application.applicationStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {application.applicationStatus.charAt(0).toUpperCase() + application.applicationStatus.slice(1)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </div>
  );
};

export default HostApplications; 