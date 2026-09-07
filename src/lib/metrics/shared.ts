import "server-only";
import type { Datum } from "@/components/charts/primitives";

export type { Datum };

/** Count occurrences of each string across a list of single/multi values. */
export function tally<T>(
  records: T[],
  extract: (record: T) => string | string[] | undefined | null,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    const raw = extract(record);
    const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
    for (const value of values) {
      const key = value.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export function mapToData(counts: Map<string, number>): Datum[] {
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
}

export function sortDesc(data: Datum[]): Datum[] {
  return [...data].sort((a, b) => b.value - a.value);
}

/** Keep the top `n`, fold the rest into an "Other" bucket. */
export function topN(data: Datum[], n: number, otherLabel = "Other"): Datum[] {
  const sorted = sortDesc(data);
  if (sorted.length <= n) return sorted;
  const head = sorted.slice(0, n);
  const tail = sorted.slice(n).reduce((sum, d) => sum + d.value, 0);
  if (tail > 0) head.push({ label: otherLabel, value: tail });
  return head;
}

/** Tally against a fixed ordered list of categories (missing ones become 0). */
export function orderedTally<T>(
  records: T[],
  order: string[],
  extract: (record: T) => string | string[] | undefined | null,
): Datum[] {
  const counts = tally(records, extract);
  return order.map((label) => ({ label, value: counts.get(label) ?? 0 }));
}

/**
 * Hide small groups from non-super-admins: any bucket with 1–(min-1) members is
 * dropped and its total rolled into a "Withheld (n<min)" row.
 */
export function suppressSmall(data: Datum[], suppress: boolean, min = 5): Datum[] {
  if (!suppress) return data;
  let withheld = 0;
  const kept = data.filter((d) => {
    if (d.value > 0 && d.value < min) {
      withheld += d.value;
      return false;
    }
    return true;
  });
  if (withheld > 0) kept.push({ label: `Withheld (n<${min})`, value: withheld });
  return kept;
}

export function toTable(data: Datum[], valueHeader = "Count") {
  return {
    columns: ["Category", valueHeader],
    rows: data.map((d) => [d.label, d.value] as [string, number]),
  };
}

const DAY = 86_400_000;

function startOfWeek(time: number): number {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

/** Continuous time series ending at the current period. */
export function timeBuckets(
  times: number[],
  period: "week" | "month",
  count: number,
): Datum[] {
  const now = new Date();
  const buckets: { start: number; label: string; value: number }[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    if (period === "week") {
      const start = startOfWeek(Date.now() - i * 7 * DAY);
      buckets.push({
        start,
        label: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: 0,
      });
    } else {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        start: d.getTime(),
        label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        value: 0,
      });
    }
  }

  const firstStart = buckets[0].start;
  for (const time of times) {
    if (Number.isNaN(time) || time < firstStart) continue;
    let index = buckets.length - 1;
    for (let i = buckets.length - 1; i >= 0; i -= 1) {
      if (time >= buckets[i].start) {
        index = i;
        break;
      }
    }
    buckets[index].value += 1;
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

/** Sum a numeric field into the same continuous buckets. */
export function timeSumBuckets(
  entries: { time: number; amount: number }[],
  period: "week" | "month",
  count: number,
): Datum[] {
  const skeleton = timeBuckets([], period, count);
  const now = new Date();
  const starts = skeleton.map((_, i) => {
    if (period === "week") return startOfWeek(Date.now() - (count - 1 - i) * 7 * DAY);
    return new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1).getTime();
  });
  const values = new Array(skeleton.length).fill(0);
  for (const { time, amount } of entries) {
    if (Number.isNaN(time) || time < starts[0]) continue;
    let index = starts.length - 1;
    for (let i = starts.length - 1; i >= 0; i -= 1) {
      if (time >= starts[i]) {
        index = i;
        break;
      }
    }
    values[index] += amount;
  }
  return skeleton.map((bucket, i) => ({ label: bucket.label, value: values[i] }));
}

/** Parse loose currency/number strings like "$1,500" or "2500". */
export function parseAmount(value: string | number | undefined | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}
