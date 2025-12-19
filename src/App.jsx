import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DonationForm from './pages/DonationForm';
import OfferingsList from './pages/OfferingsList';
import ManageUsers from './pages/ManageUsers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donate" element={<DonationForm />} />
        <Route path="/offerings" element={<OfferingsList />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
