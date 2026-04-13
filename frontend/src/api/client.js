import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://cohortconnect-1.onrender.com'),
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token (cc_token) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cc_token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;