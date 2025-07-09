import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./app/HomePage";
import LoginPage from "./app/LoginPage";
import ProfilePage from "./app/ProfilePage";
import AvailabilityPage from "./app/AvailabilityPage";
import ReportsPage from "./app/ReportsPage";
import UserManagementPage from "./app/UserManagementPage";
import './app/global.css';

import { AuthProvider } from "./components/providers/auth-provider";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Toaster } from "./components/ui/toaster";

// Optional: A simple 404 page component
function NotFoundPage() {
  return <div style={{ padding: 40, textAlign: "center" }}><h1>404 - Page Not Found</h1></div>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/" element={<HomePage />} />
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
