import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("velzo_token");
    const storedUser = localStorage.getItem("velzo_user");
    if (stored && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setToken(stored);
        setUser(parsedUser);
        setAuthTokenGetter(() => stored);
      } catch {
        localStorage.removeItem("velzo_token");
        localStorage.removeItem("velzo_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("velzo_token", newToken);
    localStorage.setItem("velzo_user", JSON.stringify(newUser));
    setAuthTokenGetter(() => newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("velzo_token");
    localStorage.removeItem("velzo_user");
    setAuthTokenGetter(null);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("velzo_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
