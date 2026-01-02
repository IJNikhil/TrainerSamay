import React from 'react';
import AppRouter from './navigation/AppRouter';
import LoadingSpinner from './components/common/LoadingSpinner'; // Assume this exists
import Header from './components/common/Header'; // Assume this exists
import { useAuth } from './hooks/useAuth'; // Use the useAuth hook
import { useThemeMode } from './context/ThemeContext'; // Use the useThemeMode hook

const RootLayout: React.FC = () => {
  const { loading: authLoading } = useAuth(); // Destructure loading from useAuth
  const { darkMode } = useThemeMode(); // Access theme mode for global styles

  // If authentication is still loading, show a spinner.
  // This prevents rendering AppRouter (and its routes/pages) until AuthProvider has initialized.
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header />
      <main
        style={{
          padding: '2rem',
          minHeight: 'calc(100vh - 80px)', // Adjust as needed
          backgroundColor: darkMode ? '#333' : '#f9f9f9', // Apply theme to main content area
          color: darkMode ? '#f5f5f5' : '#333', // Apply text color
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <AppRouter /> {/* Render AppRouter after auth is loaded */}
      </main>
    </>
  );
};

export default RootLayout;