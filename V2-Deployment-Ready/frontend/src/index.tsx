import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RootLayout from './RootLayout';
import './index.css'; // Your global styles

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <ThemeProvider> {/* ThemeProvider wraps everything */}
      <AuthProvider> {/* AuthProvider is nested inside ThemeProvider */}
        <RootLayout />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);