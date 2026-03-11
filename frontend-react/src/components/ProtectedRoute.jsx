import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Must be logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only pages: strictly check role equals 'admin'
  // Any other value — including undefined, null, 'user' — is denied
  if (adminOnly) {
    if (!user || user.role !== 'admin') {
      // Redirect non-admins silently to home with no explanation
      return <Navigate to="/" replace />;
    }
  }

  return children;
};


export default ProtectedRoute;
