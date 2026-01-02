import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { useAuth } from '../hooks/useAuth';

const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); // Used for conditional redirects

  return (
    <Router> {/* This is the single BrowserRouter for the application */}
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === 'admin' ? "/admin-dashboard" : "/dashboard"} replace />
              : <LoginPage /> // Direct component rendering
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage /> {/* DashboardPage is rendered within ProtectedRoute */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        {/* Default route based on authentication status */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={user?.role === 'admin' ? "/admin-dashboard" : "/dashboard"} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;