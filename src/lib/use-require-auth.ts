"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import type { Role } from "./types";

/**
 * ページが認証必須であることを示すフック。
 * - 未ログインなら /login にリダイレクト
 * - allowedRoles を指定するとロール不一致時にホームへ
 */
export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, user, allowedRoles, router]);

  return { user, loading };
}
