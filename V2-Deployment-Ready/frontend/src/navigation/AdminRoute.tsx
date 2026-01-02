import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // Or a spinner
  }

  // User must be authenticated AND have the 'admin' role
  if (isAuthenticated && user?.role === 'admin') {
    return <>{children}</>;
  } else if (isAuthenticated && user?.role !== 'admin') {
    // Authenticated but not an admin, redirect to dashboard or an unauthorized page
    return <Navigate to="/dashboard" replace />;
  } else {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;