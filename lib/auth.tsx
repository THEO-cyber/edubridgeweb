"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { api } from "./api";
import type { AuthUser } from "./types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

const AuthCtx = createContext<AuthState | null>(null);
const TOKEN_KEY = "eb_token";
const USER_KEY = "eb_user";

function extractAuth(data: any): { token: string; user: AuthUser } {
  const token = data?.accessToken || data?.token || "";
  const user = (data?.user || data) as AuthUser;
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {}
    setLoading(false);
  }, []);

  const persist = useCallback((t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.post("/auth/login", { email, password });
      const { token: t, user: u } = extractAuth(data);
      if (!t) throw new Error("Login failed — no token returned");
      persist(t, u);
      return u;
    },
    [persist]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await api.post("/auth/register", input);
      const { token: t, user: u } = extractAuth(data);
      if (!t) throw new Error("Registration failed");
      persist(t, u);
      return u;
    },
    [persist]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
