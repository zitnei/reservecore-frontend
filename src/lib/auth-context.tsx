"use client";

/**
 * 認証状態を React Context で共有。
 * - ページマウント時に localStorage から復元
 * - login / register / logout を提供
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getStoredUser,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  type StoredUser,
} from "./auth";
import type { LoginRequest, RegisterRequest } from "./types";

interface AuthContextValue {
  user: StoredUser | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<StoredUser>;
  register: (req: RegisterRequest) => Promise<StoredUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const u = await loginApi(req);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    const u = await registerApi(req);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
