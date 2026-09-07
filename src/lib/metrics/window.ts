import { currentTermLabel, currentTermStart, daysAgo } from "@/lib/dates";

export type RangeKey = "30d" | "90d" | "12m" | "term" | "all";

export const DEFAULT_RANGE: RangeKey = "90d";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
  { key: "term", label: "This term" },
  { key: "all", label: "All time" },
];

export type ResolvedRange = {
  key: RangeKey;
  /** Short label for chips ("last 90 days"). */
  label: string;
  /** Epoch ms; null means no lower bound. */
  startTime: number | null;
  bucket: "week" | "month";
  bucketCount: number;
};

export function parseRangeKey(value: string | undefined | null): RangeKey {
  return RANGE_OPTIONS.some((option) => option.key === value)
    ? (value as RangeKey)
    : DEFAULT_RANGE;
}

export function resolveRange(value: string | undefined | null): ResolvedRange {
  const key = parseRangeKey(value);
  switch (key) {
    case "30d":
      return { key, label: "last 30 days", startTime: daysAgo(30), bucket: "week", bucketCount: 6 };
    case "90d":
      return { key, label: "last 90 days", startTime: daysAgo(90), bucket: "week", bucketCount: 13 };
    case "12m":
      return {
        key,
        label: "last 12 months",
        startTime: daysAgo(365),
        bucket: "month",
        bucketCount: 12,
      };
    case "term":
      return {
        key,
        label: currentTermLabel(),
        startTime: currentTermStart(),
        bucket: "week",
        bucketCount: 20,
      };
    case "all":
    default:
      return { key: "all", label: "all time", startTime: null, bucket: "month", bucketCount: 24 };
  }
}

/** True when a timestamp falls inside the resolved window. */
export function inRange(time: number | null, range: ResolvedRange): boolean {
  if (time === null || Number.isNaN(time)) return false;
  return range.startTime === null || time >= range.startTime;
}
