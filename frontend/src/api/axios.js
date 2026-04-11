import axios from 'axios';

const api = axios.create({
  // Automatically use relative '/api' in Vercel production, or localhost override for local dev
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : ''),
  timeout: 60000 // Force fail requests gracefully after 60s to prevent UI locks, increased for LLMs
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
