import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '@/utils/storage';
import { adminService } from '@/services/adminService';

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
          setToken(storedToken);
          if (storedUserId) {
            setUser({
              id: storedUserId,
              name: storedName || 'Administrator',
              email: '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load stored authentication:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  // Register unauthorized response interceptor
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
        // Save to state
        setToken(response.token);
        setUser(response.user);

        // Save to AsyncStorage
        await storage.setToken(response.token);
        if (response.user) {
          await storage.setUserId(response.user.id);
          if (response.user.name) {
            await storage.saveUserName(response.user.name);
          }
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login action error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await storage.removeToken();
      await AsyncStorage.removeItem('@moodlift:userId');
      await storage.clearAllData();
    } catch (error) {
      console.error('Logout error:', error);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
