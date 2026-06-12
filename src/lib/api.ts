/**
 * API クライアント。
 * - JWT トークンを localStorage から自動で Authorization ヘッダに付与
 * - エラーは ApiError として throw (status + message + fieldErrors)
 * - 401 を受けたら自動でログアウト
 */

import type { ErrorResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const TOKEN_KEY = "reservecore.token";
const USER_KEY = "reservecore.user";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string> | null;
  constructor(status: number, message: string, fieldErrors?: Record<string, string> | null) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.name = "ApiError";
  }
}

/** トークン管理 (localStorage は SSR では undefined なのでガード) */
export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};

export const userStorage = {
  get<T>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T>(user: T): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** auth: true の時のみ Authorization ヘッダを付与 (デフォルト true) */
  auth?: boolean;
}

/**
 * 汎用 fetch ラッパー。
 * @throws {ApiError} HTTP 4xx/5xx の場合
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let payload: ErrorResponse | null = null;
    if (isJson) {
      try {
        payload = (await res.json()) as ErrorResponse;
      } catch {
        // fallthrough
      }
    }
    const message = payload?.message ?? `HTTP ${res.status}`;
    // 401: 認証切れ → トークン破棄してログイン画面へ誘導
    if (res.status === 401) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    throw new ApiError(res.status, message, payload?.fieldErrors);
  }

  if (!isJson) return undefined as T;
  return (await res.json()) as T;
}

export { API_BASE_URL };
