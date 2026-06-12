"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { Role, UserResponse } from "@/lib/types";
import type { ApiError } from "@/lib/api";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useRequireAuth(["ADMIN"]);
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    endpoints.users
      .list()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || !user) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  return (
    <Shell>
      <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">
        ← 管理ダッシュボード
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">ユーザー一覧</h1>
      <p className="mt-1 text-sm text-slate-600">
        全ロールのユーザーを表示します (ADMIN のみアクセス可)。
      </p>

      <ErrorBanner error={error} />

      {users === null && !error && (
        <p className="mt-6 text-sm text-slate-500">読み込み中...</p>
      )}

      {users && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">名前</th>
                <th className="px-4 py-3">メール</th>
                <th className="px-4 py-3">ロール</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    STAFF: "bg-blue-100 text-blue-800",
    CUSTOMER: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
}
