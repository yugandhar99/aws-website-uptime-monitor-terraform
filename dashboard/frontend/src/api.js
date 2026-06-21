import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export const uptimeAPI = {
  health: () => api.get('/health'),
  getMetrics: () => api.get('/metrics'),
  getRecentPings: () => api.get('/recent-pings'),
  getAllData: () => api.get('/uptime-data'),
};

export default api;
