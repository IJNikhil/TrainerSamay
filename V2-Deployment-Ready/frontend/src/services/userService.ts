import api from './api';

export const fetchCurrentUser = async () => {
  const response = await api.get('/users/me/');
  return response.data;
};
