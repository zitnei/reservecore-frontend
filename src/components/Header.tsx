"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          ReserveCore
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/stores" className="text-slate-700 hover:text-slate-900">
            店舗一覧
          </Link>

          {user ? (
            <>
              <Link href="/reservations" className="text-slate-700 hover:text-slate-900">
                マイ予約
              </Link>
              {(user.role === "ADMIN" || user.role === "STAFF") && (
                <Link href="/admin" className="text-slate-700 hover:text-slate-900">
                  管理
                </Link>
              )}
              <span className="hidden text-xs text-slate-500 sm:inline">
                {user.name}（{user.role}）
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-slate-900 px-3 py-1 text-white hover:bg-slate-800"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
