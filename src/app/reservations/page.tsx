"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { ReservationResponse, ReservationStatus } from "@/lib/types";
import type { ApiError } from "@/lib/api";

export default function ReservationsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [reservations, setReservations] = useState<ReservationResponse[] | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    endpoints.reservations
      .list()
      .then((data) => {
        if (!cancelled) {
          // 開始日時降順で表示
          const sorted = [...data].sort((a, b) =>
            b.startTime.localeCompare(a.startTime),
          );
          setReservations(sorted);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleCancel(id: number) {
    if (!confirm("この予約をキャンセルしますか？")) return;
    setCancellingId(id);
    try {
      const updated = await endpoints.reservations.cancel(id);
      setReservations((prev) =>
        prev?.map((r) => (r.id === id ? updated : r)) ?? null,
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setCancellingId(null);
    }
  }

  if (authLoading || !user) {
    return <Shell><p className="text-sm text-slate-500">読み込み中...</p></Shell>;
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">マイ予約</h1>
        <p className="text-xs text-slate-500">
          {user.role === "CUSTOMER"
            ? "あなたの予約のみ表示されます"
            : `${user.role}: 全ユーザーの予約を表示`}
        </p>
      </div>

      <ErrorBanner error={error} />

      {reservations === null && !error && (
        <p className="mt-6 text-sm text-slate-500">読み込み中...</p>
      )}

      {reservations && reservations.length === 0 && (
        <div className="mt-6 rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          予約はまだありません。
          <Link href="/stores" className="ml-1 font-medium text-slate-900 underline">
            店舗を見る
          </Link>
        </div>
      )}

      {reservations && reservations.length > 0 && (
        <ul className="mt-6 space-y-3">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    予約 #{r.id} ・ 店舗 {r.storeId} / サービス {r.serviceId}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {fmtDateTime(r.startTime)} 〜 {fmtTime(r.endTime)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    担当スタッフ: #{r.staffId} ・ 顧客: #{r.customerId}
                  </p>
                  {r.note && (
                    <p className="mt-1 text-xs text-slate-500">備考: {r.note}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={r.status} />
                  {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                    <button
                      type="button"
                      onClick={() => handleCancel(r.id)}
                      disabled={cancellingId === r.id}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === r.id ? "..." : "キャンセル"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const styles: Record<ReservationStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-slate-200 text-slate-600 line-through",
    COMPLETED: "bg-blue-100 text-blue-800",
  };
  const label: Record<ReservationStatus, string> = {
    PENDING: "保留",
    CONFIRMED: "確定",
    CANCELLED: "キャンセル",
    COMPLETED: "完了",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

function fmtDateTime(s: string): string {
  // "2026-07-01T10:00:00" → "2026/07/01 10:00"
  const [date, time] = s.split("T");
  const [y, m, d] = date.split("-");
  const hm = (time ?? "").slice(0, 5);
  return `${y}/${m}/${d} ${hm}`;
}

function fmtTime(s: string): string {
  const [, time] = s.split("T");
  return (time ?? "").slice(0, 5);
}
