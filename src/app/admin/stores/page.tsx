"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { StoreResponse } from "@/lib/types";
import type { ApiError } from "@/lib/api";

export default function AdminStoresPage() {
  const { user, loading: authLoading } = useRequireAuth(["ADMIN", "STAFF"]);
  const [stores, setStores] = useState<StoreResponse[] | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);

  // 作成フォーム
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [opening, setOpening] = useState("09:00");
  const [closing, setClosing] = useState("18:00");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | Error | null>(null);

  const isAdmin = user?.role === "ADMIN";

  async function refresh() {
    try {
      const data = await endpoints.stores.list();
      setStores(data);
    } catch (err) {
      setError(err as Error);
    }
  }

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await endpoints.stores.create({
        name,
        address,
        phone: phone || undefined,
        openingTime: opening,
        closingTime: closing,
      });
      setName("");
      setAddress("");
      setPhone("");
      await refresh();
    } catch (err) {
      setSubmitError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  return (
    <Shell>
      <BackLink />
      <h1 className="mt-2 text-2xl font-bold text-slate-900">店舗管理</h1>

      {isAdmin && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">新規店舗を作成</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="店舗名" id="s-name" required>
              <input
                id="s-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="電話番号 (任意)" id="s-phone">
              <input
                id="s-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="住所" id="s-address" required className="sm:col-span-2">
              <input
                id="s-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="開店時刻" id="s-open" required>
              <input
                id="s-open"
                type="time"
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="閉店時刻" id="s-close" required>
              <input
                id="s-close"
                type="time"
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <div className="sm:col-span-2">
              <ErrorBanner error={submitError} />
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? "作成中..." : "店舗を作成"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">店舗一覧</h2>
        <ErrorBanner error={error} />
        {stores === null && !error && (
          <p className="mt-3 text-sm text-slate-500">読み込み中...</p>
        )}
        {stores && stores.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">まだ店舗がありません。</p>
        )}
        {stores && stores.length > 0 && (
          <ul className="mt-3 space-y-2">
            {stores.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">
                    {s.address} ・ {fmt(s.openingTime)}〜{fmt(s.closingTime)}
                  </p>
                </div>
                <Link
                  href={`/admin/stores/${s.id}/manage`}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  管理
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

    </Shell>
  );
}

function BackLink() {
  return (
    <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">
      ← 管理ダッシュボード
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function Field({
  label,
  id,
  required,
  className,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function fmt(t: string): string {
  return t.length > 5 ? t.slice(0, 5) : t;
}
