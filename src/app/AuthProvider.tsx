import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  clearSession,
  persistSession,
  persistSessionRole,
  readSessionToken,
} from "@/lib/session-storage";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: User["role"];
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateRole: (role: User["role"]) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = readSessionToken();
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const { data } = await authService.me();
      setUser(data.user);
      persistSessionRole(data.user.role);
      return data.user;
    } catch {
      clearSession();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        const { data } = await authService.login(email, password);
        persistSession(data.token, data.user.role, rememberMe);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Unable to sign in"));
      }
    },
    [],
  );

  const register = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      role?: User["role"];
    }) => {
      try {
        const { data } = await authService.register(payload);
        persistSession(data.token, data.user.role);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Unable to create account"));
      }
    },
    [],
  );

  const updateRole = useCallback(async (role: User["role"]) => {
    try {
      const { data } = await authService.updateRole(role);
      persistSession(data.token, data.user.role);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to update account role"));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Still clear local session if the network call fails.
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      updateRole,
    }),
    [user, isLoading, login, register, logout, refreshUser, updateRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
