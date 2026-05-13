import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext();

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "admin";
  if (value === "subadmin" || value === "sub_admin" || value === "sub-admin") {
    return "subadmin";
  }

  return "user";
};

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

  const normalizeImgUrl = (img) => {
    if (!img) return null;

    if (img.startsWith("http") || img.startsWith("data:image")) {
      return img;
    }

    return `https://yourserver.com/uploads/${img}`;
  };

  useEffect(() => {
    if (user?.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;

      if (user.remember) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        sessionStorage.removeItem(STORAGE_KEYS.USER);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  const updateProfileImage = (newImgUrl) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      img_url: normalizeImgUrl(newImgUrl),
    };

    setUser(updatedUser);

    if (updatedUser.remember) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const login = (data, remember = true) => {
    setLoading(true);
    setError(null);

    try {
      const role = normalizeRole(data.role);

      const normalizedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        token: data.token,
        role,
        isAdmin: role === "admin",
        isSubAdmin: role === "subadmin",
        isUser: role === "user",
        service_station_id: data.service_station_id || null,
        img_url: normalizeImgUrl(data.img_url || null),
        remember,
      };

      setUser(normalizedUser);
    } catch (err) {
      setError(err.message || "Login failed");
      console.error("Login error:", err);
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

    const normalizedRequiredRole = normalizeRole(requiredRole);

    const permissions = {
      admin: ["admin"],
      subadmin: ["admin", "subadmin"],
      user: ["admin", "subadmin", "user"],
    };

    return permissions[normalizedRequiredRole]?.includes(user.role) || false;
  };

  const value = {
    user,
    token: user?.token,
    login,
    logout,
    updateProfileImage,
    loading,
    error,
    isAdmin: user?.isAdmin || false,
    isSubAdmin: user?.isSubAdmin || false,
    isUser: user?.isUser || false,
    isAuthenticated: !!user,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};