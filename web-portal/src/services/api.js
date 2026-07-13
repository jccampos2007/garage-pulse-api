import axios from 'axios';

const DEFAULT_API_URL = localStorage.getItem('gp_api_url') || 'https://garage-pulse-api.gscloud.us/api';

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setApiBaseUrl = (url) => {
  localStorage.setItem('gp_api_url', url);
  api.defaults.baseURL = url;
};

export const getApiBaseUrl = () => {
  return api.defaults.baseURL;
};

export default api;
