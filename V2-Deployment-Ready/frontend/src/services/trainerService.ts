import api from './api';

export const fetchAllTrainers = async () => {
  const response = await api.get('/trainers/');
  return response.data.results;
};
