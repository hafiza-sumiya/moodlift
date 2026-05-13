import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "./storage";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and owns the isLoggedIn state.
 * Login/Signup screens call login() / logout() instead of
 * imperative navigation.replace() calls, so the navigator
 * automatically transitions between auth and app stacks.
 */
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = still checking

  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getToken();
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  const login = () => setIsLoggedIn(true);

  const logout = async () => {
    await storage.removeToken();
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
