"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useAuth } from "@/lib/auth-context";
import type { ApiError } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const expired = search.get("expired") === "1";

  const { login } = useAuth();
  const [email, setEmail] = useState("admin@reservecore.com");
  const [password, setPassword] = useState("admin1234");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      router.push("/stores");
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">ログイン</h1>
        <p className="mt-1 text-sm text-slate-600">
          ADMIN お試し: <code className="font-mono">admin@reservecore.com / admin1234</code>
        </p>

        {expired && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            セッションが切れました。再度ログインしてください。
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="メールアドレス" id="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </Field>
          <Field label="パスワード" id="password">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </Field>

          <ErrorBanner error={error} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="font-medium text-slate-900 underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-12 text-center text-sm text-slate-500">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
