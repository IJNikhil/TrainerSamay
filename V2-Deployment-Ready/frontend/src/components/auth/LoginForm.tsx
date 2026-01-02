import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { loginApi } from '../../services/authService';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await loginApi(username, password);
      await login(token);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label htmlFor="username" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
          placeholder="your.username"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${
          loading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }`}
      >
        {loading ? 'Authenticating...' : 'Login'}
      </button>
      {error && (
        <div className="mt-5 text-center text-red-600 dark:text-red-400 text-base font-medium">
          {error}
        </div>
      )}
    </form>
  );
};

export default LoginForm;
