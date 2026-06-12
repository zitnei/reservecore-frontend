"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { endpoints } from "@/lib/endpoints";
import { useRequireAuth } from "@/lib/use-require-auth";
import type {
  ServiceResponse,
  StaffResponse,
  StoreResponse,
} from "@/lib/types";
import type { ApiError } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StoreDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const storeId = Number(id);
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();

  const [store, setStore] = useState<StoreResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loadError, setLoadError] = useState<ApiError | Error | null>(null);

  // 予約フォーム
  const [serviceId, setServiceId] = useState<string>("");
  const [staffId, setStaffId] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDate());
  const [time, setTime] = useState<string>("10:00");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ApiError | Error | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    if (!user || Number.isNaN(storeId)) return;
    let cancelled = false;
    Promise.all([
      endpoints.stores.get(storeId),
      endpoints.services.list(storeId),
      endpoints.staff.list(storeId),
    ])
      .then(([s, sv, st]) => {
        if (cancelled) return;
        setStore(s);
        setServices(sv);
        setStaff(st);
        if (sv.length > 0) setServiceId(String(sv[0].id));
        if (st.length > 0) setStaffId(String(st[0].userId));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err as Error);
      });
    return () => {
      cancelled = true;
    };
  }, [user, storeId]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === serviceId),
    [services, serviceId],
  );

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitOk(false);

    if (!serviceId || !staffId) {
      setSubmitError(new Error("サービスとスタッフを選択してください"));
      return;
    }

    setSubmitting(true);
    try {
      await endpoints.reservations.create({
        storeId,
        serviceId: Number(serviceId),
        staffId: Number(staffId),
        startTime: `${date}T${time}:00`,
        note: note || undefined,
      });
      setSubmitOk(true);
      // 少し見せてから遷移
      setTimeout(() => router.push("/reservations"), 1000);
    } catch (err) {
      setSubmitError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return <PageShell><p className="text-sm text-slate-500">読み込み中...</p></PageShell>;
  }

  if (loadError) {
    return (
      <PageShell>
        <ErrorBanner error={loadError} />
        <Link href="/stores" className="mt-4 inline-block text-sm text-slate-700 underline">
          ← 店舗一覧へ戻る
        </Link>
      </PageShell>
    );
  }

  if (!store) {
    return <PageShell><p className="text-sm text-slate-500">読み込み中...</p></PageShell>;
  }

  return (
    <PageShell>
      <Link href="/stores" className="text-sm text-slate-600 hover:text-slate-900">
        ← 店舗一覧
      </Link>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{store.address}</p>
        <p className="mt-1 text-xs text-slate-500">
          営業時間: {fmtTime(store.openingTime)}〜{fmtTime(store.closingTime)}
          {store.phone ? ` ・ TEL: ${store.phone}` : ""}
        </p>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">予約する</h2>

      {services.length === 0 || staff.length === 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          この店舗には{services.length === 0 ? "サービス" : "スタッフ"}がまだ登録されていません。
          ADMIN でログインして登録してください。
        </div>
      ) : (
        <form
          onSubmit={handleReserve}
          className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <Field label="サービス" id="service">
            <select
              id="service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.durationMinutes}分・¥{s.price.toLocaleString()}）
                </option>
              ))}
            </select>
          </Field>

          <Field label="担当スタッフ" id="staff">
            <select
              id="staff"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {staff.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="日付" id="date">
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="開始時刻" id="time">
              <input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step={300}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          </div>

          {selectedService && (
            <p className="text-xs text-slate-500">
              所要時間: {selectedService.durationMinutes} 分
              （終了予定: {addMinutes(time, selectedService.durationMinutes)}）
            </p>
          )}

          <Field label="備考（任意）" id="note">
            <textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </Field>

          {submitOk && (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
              予約が完了しました。マイ予約に移動します...
            </div>
          )}
          <ErrorBanner error={submitError} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "予約中..." : "この内容で予約する"}
          </button>

          <p className="text-xs text-slate-500">
            ※ 同じスタッフ・同じ時間帯に予約が重なると 409 が返ります（二重予約防止）。
            営業時間外は 400 が返ります。
          </p>
        </form>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>;
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function fmtTime(t: string): string {
  return t.length > 5 ? t.slice(0, 5) : t;
}

function defaultDate(): string {
  // 明日の日付 (YYYY-MM-DD)
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
