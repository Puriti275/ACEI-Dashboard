const numberFormat = new Intl.NumberFormat("en-US");

export function fmtInt(value: number): string {
  return numberFormat.format(Math.round(value));
}

export function fmtCompactCurrency(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${numberFormat.format(Math.round(value))}`;
}

export function fmtHours(hours: number): string {
  return numberFormat.format(Math.round(hours));
}

export function fmtShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtWeekday(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/** Percent change from `previous` to `current`. null when there is no baseline. */
export function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function fmtDelta(value: number | null): string {
  if (value === null) return "new";
  const rounded = Math.round(value);
  if (rounded === 0) return "no change";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}
