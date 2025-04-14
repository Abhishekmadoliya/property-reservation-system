import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PropertyDetails from './pages/PropertyDetails';
import BecomeHost from './pages/Auth/BecomeHost';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import HostApplications from './pages/Admin/HostApplications';
import Dashboard from './pages/Admin/Dashboard';
import NavMenu from './components/NavMenu';
import PropertyManagement from './pages/Host/PropertyManagement';
import ApplicationTester from './pages/Host/ApplicationTester';
import FixLocalStorageMismatch from './components/FixLocalStorageMismatch';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="w-full flex-grow">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/admin/host-applications" element={<HostApplications />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/host/properties" element={<PropertyManagement />} />
            <Route path="/host/application-status" element={<ApplicationTester />} />
            <Route path="/fix-sync-issue" element={<FixLocalStorageMismatch />} />
          </Routes>
        </div>
      </main>
      <NavMenu className="mt-auto" />
    </div>
  );
}

export default App;