// import axios from 'axios';
// import { API_BASE_URL } from '../utils/constants';

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Token ${token}`;
//   }
//   return config;
// });

// export default api;


import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
