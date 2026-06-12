import type { ApiError } from "@/lib/api";

interface Props {
  error: ApiError | Error | null;
}

/** API エラーを統一表示。フィールドエラーも展開する。 */
export function ErrorBanner({ error }: Props) {
  if (!error) return null;
  const isApi = "status" in error && typeof (error as ApiError).status === "number";
  const apiErr = error as ApiError;

  return (
    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      <p className="font-medium">
        {isApi ? `エラー (${apiErr.status})` : "エラー"}: {error.message}
      </p>
      {isApi && apiErr.fieldErrors && (
        <ul className="mt-1 list-inside list-disc text-xs">
          {Object.entries(apiErr.fieldErrors).map(([field, msg]) => (
            <li key={field}>
              <span className="font-mono">{field}</span>: {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
