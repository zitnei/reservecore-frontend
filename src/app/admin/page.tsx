"use client";

import Link from "next/link";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth(["ADMIN", "STAFF"]);

  if (loading || !user) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-slate-900">管理ダッシュボード</h1>
      <p className="mt-1 text-sm text-slate-600">
        ようこそ、{user.name} さん（{user.role}）
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card
          href="/admin/stores"
          title="店舗管理"
          body={isAdmin ? "店舗の作成・一覧・各店の管理" : "管理対象の店舗を一覧から開く"}
        />
        <Card
          href="/reservations"
          title="予約一覧"
          body={isAdmin || user.role === "STAFF" ? "全予約を閲覧・キャンセル" : "自分の予約のみ"}
        />
        {isAdmin && (
          <Card
            href="/admin/users"
            title="ユーザー一覧"
            body="全ユーザーのロール確認（スタッフ割当用）"
          />
        )}
        <Card
          href="/stores"
          title="顧客画面を見る"
          body="顧客が見る予約画面を確認"
        />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function Card({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow"
    >
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </Link>
  );
}
