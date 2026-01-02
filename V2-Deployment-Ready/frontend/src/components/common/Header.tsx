import React from 'react';
import { Link } from 'react-router-dom';
// Assuming your logo path is correct
// import logo from '../../assets/logo.svg';
// Using a placeholder for logo if the path is not correct or not available
const logo = 'https://via.placeholder.com/40/0000FF/FFFFFF?text=Logo'; // Placeholder logo

// Assuming you have this hook defined elsewhere.
// This example doesn't provide it, so you'll need to ensure it's correct.
// For demonstration, let's mock it if it's not crucial for the theme error.
import { useAuth } from '../../hooks/useAuth'; // You need to have this file and hook

import ThemeToggle from './ThemeToggle';
import { useThemeMode } from '../../context/ThemeContext';

const Header: React.FC = () => {
  // Replace with your actual useAuth hook if it's not mocked
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleTheme } = useThemeMode(); // This line relies on ThemeProvider being active

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      background: darkMode ? '#222' : '#f5f5f5',
      borderBottom: '1px solid #ddd',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      color: darkMode ? '#fff' : '#222', // Added color for text in header
    }}>
      <img src={logo} alt="TrainerSamay Logo" style={{ width: 40, marginRight: 16 }} />
      <h1 style={{
        flex: 1,
        fontSize: '1.5rem',
        margin: 0,
        color: darkMode ? '#fff' : '#222',
        letterSpacing: '1px'
      }}>TrainerSamayApp</h1>
      <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
      <nav>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: 16, color: darkMode ? '#fff' : '#222' }}>
              Hello, {user?.username} ({user?.role})
            </span>
            <Link to="/dashboard" style={{ marginRight: 8, color: darkMode ? '#fff' : '#222' }}>Dashboard</Link>
            {user?.role === 'admin' && (
              <Link to="/admin-dashboard" style={{ marginRight: 8, color: darkMode ? '#fff' : '#222' }}>
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              style={{
                background: darkMode ? '#444' : '#e0e0e0',
                color: darkMode ? '#fff' : '#222',
                border: 'none',
                borderRadius: 4,
                padding: '0.4rem 1rem',
                cursor: 'pointer'
              }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: darkMode ? '#fff' : '#222' }}>Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;