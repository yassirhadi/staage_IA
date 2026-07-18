import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/v1';

if (import.meta.env.DEV) console.log('API_BASE_URL:', API_BASE_URL);
if (import.meta.env.DEV) console.log('AI_SERVICE_URL:', AI_SERVICE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  responseEncoding: 'utf8',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Separate client for AI service (FastAPI)
export const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  responseEncoding: 'utf8',
});

aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (import.meta.env.DEV) console.log('AI Request:', config.method?.toUpperCase(), config.url, config.baseURL);
  return config;
});

aiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) console.log('AI Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('AI Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);
