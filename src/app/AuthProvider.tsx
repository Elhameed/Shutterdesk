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
import type { User } from "@/types";

const TOKEN_KEY = "shutterdesk_token";
const ROLE_KEY = "shutterdesk_role";
const REMEMBER_KEY = "shutterdesk_remember";

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

function persistSession(token: string, user: User, rememberMe = false) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, user.role);

  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const { data } = await authService.me();
      setUser(data.user);
      localStorage.setItem(ROLE_KEY, data.user.role);
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
        persistSession(data.token, data.user, rememberMe);
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
        persistSession(data.token, data.user);
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
      persistSession(data.token, data.user);
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
