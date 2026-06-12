export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
        <p>
          ReserveCore — 予約管理 API のデモフロントエンド
          <span className="mx-2">·</span>
          <a
            href="https://github.com/zitnei/ReserveCore"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            GitHub (backend)
          </a>
        </p>
      </div>
    </footer>
  );
}
