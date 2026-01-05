import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../../features/auth/auth.types';
import { authApi } from '../../features/auth/auth.api';

interface AuthContextType {
  user: User | null;
  access: string | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = (payload: AuthResponse) => {
    setAccess(payload.access);
    setUser(payload.user);
    localStorage.setItem("user", JSON.stringify(payload.user));
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccess(null);
      setUser(null);

      localStorage.removeItem("user");
      localStorage.removeItem("activeTeam");

      window.location.href = '/login';
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const newAccess = await authApi.refresh();
      setAccess(newAccess);
      return newAccess;
    } catch (err) {
      await logout();
      return null;
    }
  }, [logout]);

  // Startup silent refresh
  useEffect(() => {
    let isMounted = true;
    // Only refresh if we have a user (session) but no access token in memory
    const initAuth = async () => {
      if (user && !access) {
        await refreshAccessToken();
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };
    initAuth();

    return () => { isMounted = false; };
  }, [user, access, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ user, access, isLoading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};