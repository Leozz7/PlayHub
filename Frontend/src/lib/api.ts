import axios from 'axios';
import { useAuthStore } from '@/data/useAuthStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => response, async (error) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
  }
  return Promise.reject(error);
});
