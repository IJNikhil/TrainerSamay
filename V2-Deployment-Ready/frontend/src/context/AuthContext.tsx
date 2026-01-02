import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'trainer';
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, type?: 'jwt' | 'drf') => Promise<void>;
  logout: () => void;
  tokenType: 'jwt' | 'drf' | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenType, setTokenType] = useState<'jwt' | 'drf' | null>(null);

  function detectTokenType(token: string): 'jwt' | 'drf' {
    return token.split('.').length === 3 ? 'jwt' : 'drf';
  }

  const decodeToken = useCallback((token: string): User | null => {
    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.user_id || decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
      };
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }, []);

  const fetchUser = useCallback(async (token: string, type: 'jwt' | 'drf') => {
    try {
      api.defaults.headers.common['Authorization'] =
        type === 'jwt' ? `Bearer ${token}` : `Token ${token}`;
      const res = await api.get('/users/me/');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenType');
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const login = useCallback(async (token: string, type?: 'jwt' | 'drf') => {
    const actualType = type || detectTokenType(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('tokenType', actualType);
    setTokenType(actualType);

    if (actualType === 'jwt') {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        logout();
      }
    } else {
      await fetchUser(token, 'drf');
    }
  }, [decodeToken, fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setTokenType(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const type = localStorage.getItem('tokenType') as 'jwt' | 'drf' | null;
    if (token && type) {
      setTokenType(type);
      if (type === 'jwt') {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
          setIsAuthenticated(true);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('accessToken');
        }
        setLoading(false);
      } else {
        fetchUser(token, 'drf').finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [decodeToken, fetchUser]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    tokenType,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
