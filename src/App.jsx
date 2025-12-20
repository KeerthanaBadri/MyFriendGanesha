import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DonationForm from './pages/DonationForm';
import OfferingsList from './pages/OfferingsList';
import ManageUsers from './pages/ManageUsers';
import Events from './pages/Events';
import ReceiptView from './pages/ReceiptView';
import ExpenseManager from './pages/ExpenseManager';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = localStorage.getItem('currentUser');
  const role = localStorage.getItem('role');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/donate" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <DonationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offerings"
          element={
            <ProtectedRoute>
              <OfferingsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/manage-users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <AdminRoute>
              <ExpenseManager />
            </AdminRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/receipt/:id" element={<ReceiptView />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Helper route for logout */}
        <Route path="/logout" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
