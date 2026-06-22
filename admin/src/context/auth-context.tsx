import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "@/utils/storage";
import { adminService } from "@/services/adminService";
import { useRouter } from "expo-router";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check for existing token in AsyncStorage
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await storage.getToken();
        const storedUserId = await storage.getUserId();
        const storedName = await storage.getUserName();

        if (storedToken) {
          try {
            await adminService.getDashboardStats(); // token verify
            setToken(storedToken);

            if (storedUserId) {
              setUser({
                id: storedUserId,
                name: storedName || "Administrator",
                email: "",
              });
            }
          } catch {
            await logout();
          }
        }
      } catch (error) {
        console.error("Failed to load stored authentication:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStoredAuth();
  }, []);
  const router = useRouter();

  // Register unauthorized response interceptor BEFORE attempting verification
  useEffect(() => {
    adminService.onUnauthorized = async () => {
      await logout();
    };
    return () => {
      adminService.onUnauthorized = null;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await adminService.login(email, password);

      if (response.success && response.token) {
        // Determine admin/user payload (backend may return `admin` or `user`)
        const actor = response.admin || response.user || null;

        // Save to state
        setToken(response.token);
        setUser(actor);

        // Save to AsyncStorage
        await storage.setToken(response.token);
        if (actor) {
          if (actor.id) await storage.setUserId(actor.id);
          if (actor.name) await storage.saveUserName(actor.name);
        }
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login action error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@moodlift:token");
      await AsyncStorage.removeItem("@moodlift:userId");
      await storage.clearAllData();

      setToken(null);
      setUser(null);
      // Navigate to login immediately; RouteGuard will also handle redirects
      try {
        router.replace("/login");
      } catch (e) {
        // router may be unavailable in some test environments
        console.warn("Router navigation failed during logout:", e);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
