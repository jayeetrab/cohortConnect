import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://cohortconnect-1.onrender.com'),
  timeout: 300000 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cc_token');
  if(token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
