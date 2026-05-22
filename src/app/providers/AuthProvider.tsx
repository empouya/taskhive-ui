import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../../features/auth/auth.api';
import type { AuthResponse, User } from '../../features/auth/auth.types';
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

const STORAGE_KEY_USER = 'user';
const STORAGE_KEY_TEAM = 'activeTeam';

const readUserFromStorage = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const persistUserToStorage = (user: User): void => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TEAM);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(readUserFromStorage);
  const [isLoading, setIsLoading] = useState(true);

  // Guards against concurrent logout calls
  const isLoggingOut = useRef(false);
  // Signals to the refresh interceptor that bootstrap is in flight
  // so it does not try to trigger a second refresh concurrently
  const isBootstrapping = useRef(true);

  // ------------------------------------------------------------------
  // Session helpers
  // ------------------------------------------------------------------

  const clearSession = useCallback(() => {
    setAccess(null);
    setUser(null);
    clearStorage();
  }, []);

  const login = useCallback((payload: AuthResponse) => {
    setAccess(payload.access);
    setUser(payload.user);
    persistUserToStorage(payload.user);
  }, []);

  const logout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      await authApi.logout();
    } catch {
      // Best-effort — always clear local session even if the API call fails
    } finally {
      clearSession();
      isLoggingOut.current = false;
      window.location.href = '/login';
    }
  }, [clearSession]);

  // ------------------------------------------------------------------
  // Token refresh — called by the Axios interceptor on 401s
  // and also directly during bootstrap
  // ------------------------------------------------------------------

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Do not attempt a refresh while we are already bootstrapping —
    // the bootstrap will resolve the token itself
    if (isBootstrapping.current) return null;

    try {
      const newAccess = await authApi.refresh();
      setAccess(newAccess);
      return newAccess;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  // ------------------------------------------------------------------
  // Register auth handlers synchronously so they are always current
  // before any Axios request fires (useMemo runs during render)
  // ------------------------------------------------------------------

  useMemo(() => {
    registerApiAuth({
      getAccessToken: () => access,
      refreshAccessToken,
      logout,
    });
  }, [access, refreshAccessToken, logout]);

  // ------------------------------------------------------------------
  // Session bootstrap — runs once on mount
  //
  // Strategy: always attempt a silent token refresh using the HttpOnly
  // refresh cookie, regardless of what is in localStorage.
  // This allows session recovery even after localStorage was cleared.
  // ------------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      isBootstrapping.current = true;
      setIsLoading(true);

      try {
        const newAccess = await authApi.refresh();

        if (!isMounted) return;

        setAccess(newAccess);

        // If we got a token but have no user record locally,
        // fetch the current user from the backend
        if (!user) {
          try {
            console.log(newAccess);
            const me = await authApi.me(newAccess);
            if (isMounted) {
              setUser(me);
              persistUserToStorage(me);
            }
          } catch {
            // Token valid but /me/ failed — treat as logged out
            if (isMounted) clearSession();
          }
        }
      } catch {
        // Refresh cookie is absent or expired — clear any stale local data
        if (isMounted) clearSession();
      } finally {
        if (isMounted) {
          isBootstrapping.current = false;
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once on mount only

  return (
    <AuthContext.Provider
      value={{ user, access, isLoading, login, logout, refreshAccessToken }}
    >
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