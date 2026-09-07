/**
 * Chart color roles. Values resolve to the `--viz-*` custom properties in
 * globals.css (dataviz-validated categorical slots + UT-orange brand hue), so a
 * future dark-mode toggle swaps them in one place.
 *
 * - Single-series magnitude charts (most of the dashboard) use `BRAND`.
 * - Charts with 2+ distinct series use `SERIES` in fixed order, never cycled.
 * - `MUTED` is the de-emphasis hue for "one series is the point" charts.
 */
export const CHART = {
  brand: "var(--viz-brand)",
  muted: "var(--viz-muted)",
  grid: "var(--viz-grid)",
  axis: "var(--viz-axis)",
  series: [
    "var(--viz-series-1)",
    "var(--viz-series-2)",
    "var(--viz-series-3)",
    "var(--viz-series-4)",
    "var(--viz-series-5)",
    "var(--viz-series-6)",
  ],
} as const;

export const AXIS_TICK = {
  fill: "var(--muted-foreground)",
  fontSize: 11,
} as const;

export const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
  boxShadow: "0 4px 16px -6px rgba(0,0,0,0.2)",
  padding: "6px 10px",
} as const;

export function seriesColor(index: number): string {
  return CHART.series[index % CHART.series.length];
}
