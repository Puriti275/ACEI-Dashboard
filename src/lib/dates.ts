export const DAY_MS = 86_400_000;

export function daysAgo(days: number): number {
  return Date.now() - days * DAY_MS;
}

export function daysFromNow(days: number): number {
  return Date.now() + days * DAY_MS;
}

export function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Start of the current academic term, UT Knoxville calendar:
 * Fall (Aug–Dec) → Aug 1, Spring (Jan–Apr) → Jan 1, Summer (May–Jul) → May 1.
 */
export function currentTermStart(now: Date = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) return new Date(year, 7, 1).getTime();
  if (month >= 4) return new Date(year, 4, 1).getTime();
  return new Date(year, 0, 1).getTime();
}

export function currentTermLabel(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) return `Fall ${year}`;
  if (month >= 4) return `Summer ${year}`;
  return `Spring ${year}`;
}
