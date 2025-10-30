// File: frontend/src/api.js

import axios from 'axios';

const API_BACKEND = 'https://backendsja-890420967859.asia-southeast2.run.app';

const api = axios.create({
  baseURL: API_BACKEND
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;