import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) ||
        JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER)) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      if (!user.remember) {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEYS.USER);
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.USER);
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  const login = (data, remember = true) => {
    setLoading(true);
    setError(null);
    try {
      const backendRole = data.role || '';
      const normalizedRole = backendRole.toLowerCase().replace('-', '');

      const normalizedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        token: data.token,
        role: normalizedRole,
        isAdmin: normalizedRole === 'admin',
        isSubAdmin: normalizedRole === 'subadmin',
        isUser: normalizedRole === 'user' || !normalizedRole,
        remember,
      };

      setUser(normalizedUser);
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const permissions = {
      admin: ['admin'],
      subadmin: ['admin', 'subadmin'],
      user: ['admin', 'subadmin', 'user'],
    };

    return permissions[requiredRole]?.includes(user.role) || false;
  };

  const value = {
    user,
    token: user?.token,
    login,
    logout,
    loading,
    error,
    isAdmin: user?.isAdmin || false,
    isSubAdmin: user?.isSubAdmin || false,
    isUser: user?.isUser || false,
    isAuthenticated: !!user,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
