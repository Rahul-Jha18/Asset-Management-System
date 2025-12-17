// src/services/authService.js
import api from './api';

export const login = (email, password) =>
  api
    .post('/api/auth/login', { email, password })
    .then((res) => (res.data && res.data.data) || res.data);

export const register = (name, email, password) =>
  api
    .post('/api/auth/register', { name, email, password })
    .then((res) => (res.data && res.data.data) || res.data);
