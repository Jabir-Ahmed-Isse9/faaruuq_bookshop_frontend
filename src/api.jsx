import axios from 'axios';

const API = axios.create({
  baseURL:  import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Inject adminToken or user token
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Handle 401 — auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠ Session expired — redirecting to login...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;