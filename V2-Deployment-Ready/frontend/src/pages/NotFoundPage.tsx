import React from 'react';
import { useThemeMode } from '../context/ThemeContext'; // Import useThemeMode

const NotFoundPage: React.FC = () => {
  const { darkMode } = useThemeMode(); // Access theme mode
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px',
        color: darkMode ? '#f5f5f5' : '#333', // Theme-dependent text color
      }}
    >
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFoundPage;