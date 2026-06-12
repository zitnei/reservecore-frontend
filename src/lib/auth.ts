/**
 * 認証 API のラッパーと、保存済みユーザー情報の取得。
 */
import { apiFetch, tokenStorage, userStorage } from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest, Role } from "./types";

export interface StoredUser {
  email: string;
  name: string;
  role: Role;
}

export async function login(req: LoginRequest): Promise<StoredUser> {
  const res = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: req,
    auth: false,
  });
  return persist(res);
}

export async function register(req: RegisterRequest): Promise<StoredUser> {
  const res = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: req,
    auth: false,
  });
  return persist(res);
}

export function logout(): void {
  tokenStorage.clear();
}

export function getStoredUser(): StoredUser | null {
  return userStorage.get<StoredUser>();
}

export function isAuthenticated(): boolean {
  return !!tokenStorage.get();
}

function persist(res: AuthResponse): StoredUser {
  tokenStorage.set(res.token);
  const stored: StoredUser = { email: res.email, name: res.name, role: res.role };
  userStorage.set(stored);
  return stored;
}
