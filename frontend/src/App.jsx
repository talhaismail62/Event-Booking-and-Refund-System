import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customerdashboard';
import StaffDashboard from './pages/staffdashboard';
import AdminDashboard from './pages/admindashboard';
import NewBooking from './pages/newbooking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/book-hall" element={<NewBooking />} />
      </Routes>
    </Router>
  );
}

export default App;