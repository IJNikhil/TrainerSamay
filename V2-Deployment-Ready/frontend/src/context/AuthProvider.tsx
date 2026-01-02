// import React, { useState, useEffect } from 'react';
// import type { User } from '../types/auth';
// import api from '../services/api';
// import { AuthContext } from './AuthContext';

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUser = async () => {
//     try {
//       const response = await api.get('/users/me/');
//       setUser(response.data);
//     } catch {
//       localStorage.removeItem('authToken');
//       setAuthToken(null);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authToken) {
//       fetchUser();
//     } else {
//       setLoading(false);
//     }
//   }, [authToken]);

//   const login = async (token: string) => {
//     localStorage.setItem('authToken', token);
//     setAuthToken(token);
//     await fetchUser();
//   };

//   const logout = () => {
//     localStorage.removeItem('authToken');
//     setAuthToken(null);
//     setUser(null);
//   };

//   const isAuthenticated = !!authToken && !!user;

//   return (
//     <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
