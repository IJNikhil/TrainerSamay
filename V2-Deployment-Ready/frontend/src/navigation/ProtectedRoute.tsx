import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('[ProtectedRoute] loading:', loading, 'isAuthenticated:', isAuthenticated); // For debugging

  // This check is important: don't render children (or redirect) until auth is determined.
  if (loading) {
    return null; // Or return a specific loading component if you prefer a different UI here
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;