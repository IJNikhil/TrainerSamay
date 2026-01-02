import api from './api';

// DRF Token login
export const loginApi = async (username: string, password: string) => {
  const response = await api.post('/auth-token/', { username, password });
  return response.data.token;
};

// JWT login (if you want to support JWT login from frontend)
export const loginJWTApi = async (username: string, password: string) => {
  const response = await api.post('/token/', { username, password });
  return response.data.access;
};
