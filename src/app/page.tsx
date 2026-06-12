import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Portfolio Demo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          ReserveCore — 予約管理 API のデモ
        </h1>
        <p className="mt-3 text-slate-600">
          Spring Boot + PostgreSQL で構築した REST API を、Next.js のフロントから実際に操作できます。
          認証・権限制御・二重予約防止・統一エラーハンドリングなど、実務で必要な観点を実装しています。
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/stores"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            店舗を見る
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            新規登録 (お試し)
          </Link>
        </div>

        <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">面接官様向けクイックガイド</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              ADMIN アカウント: <code className="font-mono">admin@reservecore.com</code> /
              <code className="font-mono"> admin1234</code>
              （本番デプロイ後は環境変数で上書き）
            </li>
            <li>
              CUSTOMER として新規登録 → 店舗からサービスを選んで予約 → マイ予約からキャンセル、までを一通り体験できます。
            </li>
            <li>
              バックエンドは Render Free プランで稼働しているため、初回アクセスは起動に
              <strong className="mx-1">30秒〜1分</strong>かかる場合があります。
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <FeatureCard
          title="多層の認可"
          body="URL レベル (SecurityFilterChain)・メソッドレベル (@PreAuthorize)・ドメイン (自店スタッフ判定) の 3 層で権限を制御。"
        />
        <FeatureCard
          title="二重予約防止 (二段構え)"
          body="アプリ層の事前チェック (409) と PostgreSQL の EXCLUDE 制約 (btree_gist) でDBレベルでも防止。"
        />
        <FeatureCard
          title="統一エラーフォーマット"
          body="@RestControllerAdvice で例外を一元処理し、{status, message, fieldErrors, timestamp} で返却。"
        />
        <FeatureCard
          title="結合テスト 46 件 + CI"
          body="実 PostgreSQL に対して MockMvc で 46 件の結合テスト。GitHub Actions で毎 push 自動実行。"
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
