"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type {
  ServiceResponse,
  StaffResponse,
  StoreResponse,
  UserResponse,
} from "@/lib/types";
import type { ApiError } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StoreManagePage({ params }: PageProps) {
  const { id } = use(params);
  const storeId = Number(id);
  const { user, loading: authLoading } = useRequireAuth(["ADMIN", "STAFF"]);

  const [store, setStore] = useState<StoreResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadError, setLoadError] = useState<ApiError | Error | null>(null);

  const isAdmin = user?.role === "ADMIN";

  async function refresh() {
    try {
      const [s, sv, st] = await Promise.all([
        endpoints.stores.get(storeId),
        endpoints.services.list(storeId),
        endpoints.staff.list(storeId),
      ]);
      setStore(s);
      setServices(sv);
      setStaff(st);
      if (isAdmin) {
        try {
          setUsers(await endpoints.users.list());
        } catch {
          // ADMIN以外の権限でアクセスされた場合は無視
        }
      }
    } catch (err) {
      setLoadError(err as Error);
    }
  }

  useEffect(() => {
    if (user && !Number.isNaN(storeId)) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, storeId]);

  if (authLoading || !user) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  if (loadError) {
    return (
      <Shell>
        <ErrorBanner error={loadError} />
        <BackLink />
      </Shell>
    );
  }

  if (!store) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  return (
    <Shell>
      <BackLink />
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{store.name} の管理</h1>
      <p className="mt-1 text-sm text-slate-600">
        {store.address} ・ {fmt(store.openingTime)}〜{fmt(store.closingTime)}
      </p>

      {/* サービス管理 (ADMIN または自店STAFF) */}
      <ServicesSection
        storeId={storeId}
        services={services}
        onChanged={refresh}
      />

      {/* スタッフ管理 (ADMINのみ) */}
      {isAdmin && (
        <StaffSection
          storeId={storeId}
          staff={staff}
          users={users}
          onChanged={refresh}
        />
      )}
    </Shell>
  );
}

// ---------- Services section ----------
function ServicesSection({
  storeId,
  services,
  onChanged,
}: {
  storeId: number;
  services: ServiceResponse[];
  onChanged: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(3000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await endpoints.services.create(storeId, {
        name,
        durationMinutes: duration,
        price,
      });
      setName("");
      await onChanged();
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">サービス (メニュー)</h2>
      <p className="text-xs text-slate-500">
        ADMIN または自店 STAFF が登録できます。
      </p>

      <form onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-4">
        <input
          required
          placeholder="サービス名 (例: カット)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          required
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="分"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="価格 (円)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="sm:col-span-4">
          <ErrorBanner error={error} />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "追加中..." : "サービスを追加"}
          </button>
        </div>
      </form>

      {services.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">まだサービスがありません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-slate-900">{s.name}</span>
              <span className="text-xs text-slate-500">
                {s.durationMinutes}分・¥{s.price.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Staff section ----------
function StaffSection({
  storeId,
  staff,
  users,
  onChanged,
}: {
  storeId: number;
  staff: StaffResponse[];
  users: UserResponse[];
  onChanged: () => Promise<void>;
}) {
  const assignedIds = new Set(staff.map((s) => s.userId));
  // CUSTOMER + STAFF (まだこの店に未割当のもの) から選ぶ
  const candidates = users.filter(
    (u) => u.role !== "ADMIN" && !assignedIds.has(u.id),
  );

  const [selectedId, setSelectedId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (candidates.length > 0 && !selectedId) {
      setSelectedId(String(candidates[0].id));
    }
  }, [candidates, selectedId]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null);
    setSubmitting(true);
    try {
      await endpoints.staff.assign(storeId, { userId: Number(selectedId) });
      await onChanged();
      setSelectedId("");
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(userId: number) {
    if (!confirm("このスタッフの割当を解除しますか？")) return;
    setRemovingId(userId);
    setError(null);
    try {
      await endpoints.staff.remove(storeId, userId);
      await onChanged();
    } catch (err) {
      setError(err as Error);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">スタッフ割当 (ADMIN)</h2>
      <p className="text-xs text-slate-500">
        ユーザーを店舗スタッフに割当てます (CUSTOMER は STAFF に自動昇格)。
      </p>

      {candidates.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">割当可能なユーザーがいません。</p>
      ) : (
        <form onSubmit={handleAssign} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              割当するユーザー
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) [{u.role}]
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !selectedId}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "割当中..." : "割当てる"}
          </button>
        </form>
      )}

      <ErrorBanner error={error} />

      {staff.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">まだスタッフがいません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {staff.map((s) => (
            <li
              key={s.userId}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>
                <span className="font-medium text-slate-900">{s.name}</span>
                <span className="ml-2 text-xs text-slate-500">{s.email}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(s.userId)}
                disabled={removingId === s.userId}
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {removingId === s.userId ? "..." : "解除"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Shared ----------
function BackLink() {
  return (
    <Link href="/admin/stores" className="text-sm text-slate-600 hover:text-slate-900">
      ← 店舗一覧
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function fmt(t: string): string {
  return t.length > 5 ? t.slice(0, 5) : t;
}
