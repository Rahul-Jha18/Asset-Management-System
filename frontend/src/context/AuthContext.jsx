import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext();

const normalizeRole = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "_");

  if (value === "admin") return "admin";

  if (value === "subadmin" || value === "sub_admin") {
    return "subadmin";
  }

  if (value === "corp_user" || value === "corpuser") {
    return "corp_user";
  }

  if (value === "support") return "support";

  return "user";
};

const formatRole = (role) => {
  const value = normalizeRole(role);

  if (value === "admin") return "Administrator";
  if (value === "subadmin") return "Sub Admin";
  if (value === "corp_user") return "Corporate User";
  if (value === "support") return "Support";

  return "User";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null") ||
        JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER) || "null") ||
        JSON.parse(localStorage.getItem("ims_user") || "null") ||
        JSON.parse(sessionStorage.getItem("ims_user") || "null") ||
        null;

      if (!stored) return null;

      const role = normalizeRole(stored.role);

      return {
        ...stored,
        role,
        roleLabel: formatRole(role),
        isAdmin: role === "admin",
        isSubAdmin: role === "subadmin",
        isCorpUser: role === "corp_user",
        isUser: role === "user",
      };
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
      api.defaults.headers.common.Authorization = `Bearer ${user.token}`;

      if (user.remember) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem("ims_user", JSON.stringify(user));

        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem("ims_user");
      } else {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        sessionStorage.setItem("ims_user", JSON.stringify(user));

        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem("ims_user");
      }
    } else {
      delete api.defaults.headers.common.Authorization;

      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem("ims_user");
      sessionStorage.removeItem("ims_user");
    }
  }, [user]);

  const updateProfileImage = (newImgUrl) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      img_url: normalizeImgUrl(newImgUrl),
    };

    setUser(updatedUser);
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
        roleLabel: formatRole(role),

        isAdmin: role === "admin",
        isSubAdmin: role === "subadmin",
        isCorpUser: role === "corp_user",
        isUser: role === "user",

        service_station_id: data.service_station_id || null,
        branch_id: data.branch_id || data.service_station_id || null,

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
      corp_user: ["admin", "corp_user"],
      user: ["admin", "subadmin", "corp_user", "user"],
    };

    return permissions[normalizedRequiredRole]?.includes(user.role) || false;
  };

  const role = normalizeRole(user?.role);

  const value = {
    user,
    setUser,
    token: user?.token,

    login,
    logout,
    updateProfileImage,

    loading,
    error,

    role,
    roleLabel: formatRole(role),

    isAdmin: role === "admin",
    isSubAdmin: role === "subadmin",
    isCorpUser: role === "corp_user",
    isUser: role === "user",

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
