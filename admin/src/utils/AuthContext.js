import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "./storage";
import { adminService } from "@/services/adminService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = still checking

  useEffect(() => {
    // Verify stored token with server before considering authenticated
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        try {
          await adminService.getDashboardStats();
          setIsLoggedIn(true);
        } catch (err) {
          // token invalid/expired
          await storage.removeToken();
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Register unauthorized handler so that service-level 401s trigger logout
  useEffect(() => {
    adminService.onUnauthorized = async () => {
      await logout();
    };
    return () => {
      adminService.onUnauthorized = null;
    };
  }, []);

  const login = () => setIsLoggedIn(true);

  const logout = async () => {
    try {
      await storage.removeToken();
    } catch (e) {
      console.warn("Failed clearing token on logout:", e);
    }
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
