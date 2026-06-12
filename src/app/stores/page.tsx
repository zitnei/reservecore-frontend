"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { StoreResponse } from "@/lib/types";
import type { ApiError } from "@/lib/api";

export default function StoresPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [stores, setStores] = useState<StoreResponse[] | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    endpoints.stores
      .list()
      .then((data) => {
        if (!cancelled) setStores(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || !user) {
    return <PageShell><p className="text-sm text-slate-500">読み込み中...</p></PageShell>;
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-slate-900">店舗一覧</h1>
      <p className="mt-1 text-sm text-slate-600">予約したい店舗を選んでください。</p>

      <ErrorBanner error={error} />

      {stores === null && !error && (
        <p className="mt-6 text-sm text-slate-500">読み込み中...</p>
      )}

      {stores && stores.length === 0 && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          店舗がまだ登録されていません。ADMIN でログインして店舗を作成してください。
        </div>
      )}

      {stores && stores.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {stores.map((store) => (
            <li key={store.id}>
              <Link
                href={`/stores/${store.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow"
              >
                <h2 className="text-base font-semibold text-slate-900">{store.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{store.address}</p>
                <p className="mt-2 text-xs text-slate-500">
                  営業時間: {formatTime(store.openingTime)}〜{formatTime(store.closingTime)}
                </p>
                {store.phone && (
                  <p className="text-xs text-slate-500">TEL: {store.phone}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>;
}

/** "09:00:00" → "09:00" */
function formatTime(t: string): string {
  return t.length > 5 ? t.slice(0, 5) : t;
}
