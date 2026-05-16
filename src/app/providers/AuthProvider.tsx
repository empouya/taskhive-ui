import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../../features/auth/auth.types';
import { authApi } from '../../features/auth/auth.api';
import { registerApiAuth } from '../../lib/apiClient';

interface AuthContextType {
  user: User | null;
  access: string | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? (JSON.parse(storedUser) as User) : null;
    } catch {
      return null;
    }
  });

  const clearSession = useCallback(() => {
    setAccess(null);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('activeTeam');
  }, []);

  const persistUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  }, []);

  const login = useCallback((payload: AuthResponse) => {
    setAccess(payload.access);
    persistUser(payload.user);
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  }, [clearSession]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const newAccess = await authApi.refresh();
      setAccess(newAccess);
      return newAccess;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    registerApiAuth({
      getAccessToken: () => access,
      refreshAccessToken,
      logout,
    });
  }, [access, refreshAccessToken, logout]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const newAccess = await authApi.refresh();
        if (!isMounted) return;

        setAccess(newAccess);

        const currentUser = await authApi.me();
        if (!isMounted) return;

        persistUser(currentUser);
      } catch {
        if (!isMounted) return;
        clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, persistUser]);

  return (
    <AuthContext.Provider value={{ user, access, isLoading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};