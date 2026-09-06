export default function BriefingLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-56 rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="h-72 rounded-xl border border-border bg-card" />
        <div className="h-72 rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
