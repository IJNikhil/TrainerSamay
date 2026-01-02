import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import { useThemeMode } from '../context/ThemeContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const { darkMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(user.role === 'admin' ? "/admin-dashboard" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
        darkMode ? 'bg-gradient-to-br from-gray-950 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-white text-gray-900'
      }`}
    >
      <div
        className={`w-full max-w-md p-10 rounded-3xl shadow-2xl transition-all duration-500 ${
          darkMode ? 'bg-gray-800 shadow-gray-700/40 border border-gray-700' : 'bg-white shadow-blue-200/60 border border-blue-100'
        } transform hover:scale-102 hover:shadow-3xl`}
      >
        <h2 className={`text-4xl font-extrabold text-center mb-8 tracking-tight transition-colors duration-500 ${
          darkMode ? 'text-blue-400' : 'text-blue-700'
        }`}>
          Sign In
        </h2>
        <LoginForm />
        <div className="flex justify-center mt-8">
          <button
            onClick={toggleTheme}
            className={`px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
              darkMode
                ? 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {darkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
