"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-lg font-semibold">Something went wrong loading this page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "The dashboard could not reach Airtable. This is usually temporary."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
