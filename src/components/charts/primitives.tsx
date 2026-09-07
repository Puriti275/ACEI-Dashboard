"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART, TOOLTIP_STYLE, seriesColor } from "./theme";

export type Datum = { label: string; value: number };
export type SeriesKey = { key: string; name: string };

/** Serializable across the server/client boundary — no function props. */
export type ValueFormat = "number" | "currencyCompact";

const intFmt = new Intl.NumberFormat("en-US");

function makeFormatter(kind: ValueFormat = "number"): (n: number) => string {
  if (kind === "currencyCompact") {
    return (n) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
      return `$${intFmt.format(Math.round(n))}`;
    };
  }
  return (n) => intFmt.format(Math.round(n));
}

const toNum = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);
const cursorFill = { fill: "var(--viz-muted)", opacity: 0.1 };

/** Recharts' ResponsiveContainer needs a real width; render only on the client. */
const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/** Single-series bar chart. Horizontal by default (best for named categories). */
export function CategoryBar({
  data,
  orientation = "horizontal",
  height = 260,
  color = CHART.brand,
  valueFormat = "number",
  showValues,
}: {
  data: Datum[];
  orientation?: "horizontal" | "vertical";
  height?: number;
  color?: string;
  valueFormat?: ValueFormat;
  showValues?: boolean;
}) {
  const mounted = useMounted();
  const format = makeFormatter(valueFormat);
  const fmt = (value: unknown) => format(toNum(value));
  const withValues = showValues ?? orientation === "horizontal";
  const chartHeight =
    orientation === "horizontal" ? Math.max(height, data.length * 34 + 24) : height;

  if (!mounted) return <div style={{ height: chartHeight }} aria-hidden />;

  if (orientation === "horizontal") {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: withValues ? 44 : 12, bottom: 4, left: 8 }}
          barCategoryGap="22%"
        >
          <CartesianGrid horizontal={false} stroke={CHART.grid} />
          <XAxis type="number" tick={AXIS_TICK} stroke={CHART.axis} tickFormatter={fmt} />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={AXIS_TICK}
            stroke={CHART.axis}
            interval={0}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={cursorFill} formatter={fmt} />
          <Bar dataKey="value" fill={color} maxBarSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {withValues && (
              <LabelList
                dataKey="value"
                position="right"
                formatter={fmt}
                style={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={CHART.axis} interval={0} />
        <YAxis tick={AXIS_TICK} stroke={CHART.axis} tickFormatter={fmt} width={44} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={cursorFill} formatter={fmt} />
        <Bar dataKey="value" fill={color} maxBarSize={40} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Single-series trend over time. */
export function TrendChart({
  data,
  type = "line",
  height = 240,
  color = CHART.brand,
  valueFormat = "number",
}: {
  data: Datum[];
  type?: "line" | "area";
  height?: number;
  color?: string;
  valueFormat?: ValueFormat;
}) {
  const mounted = useMounted();
  const format = makeFormatter(valueFormat);
  const fmt = (value: unknown) => format(toNum(value));
  const activeDot = { r: 4, strokeWidth: 2, stroke: "var(--card)" };

  if (!mounted) return <div style={{ height }} aria-hidden />;

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="label" tick={AXIS_TICK} stroke={CHART.axis} minTickGap={24} />
          <YAxis tick={AXIS_TICK} stroke={CHART.axis} tickFormatter={fmt} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.1}
            isAnimationActive={false}
            dot={false}
            activeDot={activeDot}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={CHART.axis} minTickGap={24} />
        <YAxis tick={AXIS_TICK} stroke={CHART.axis} tickFormatter={fmt} width={44} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
          activeDot={activeDot}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Part-to-whole, up to 6 slices. */
export function DonutChart({
  data,
  height = 240,
  valueFormat = "number",
}: {
  data: Datum[];
  height?: number;
  valueFormat?: ValueFormat;
}) {
  const mounted = useMounted();
  const format = makeFormatter(valueFormat);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const slices = data.map((entry, index) => ({ ...entry, fill: seriesColor(index) }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="w-full max-w-60" style={{ height }}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: unknown, name: unknown) => [
                  `${format(toNum(value))} (${total ? Math.round((toNum(value) / total) * 100) : 0}%)`,
                  String(name),
                ]}
              />
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="58%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="flex flex-col gap-1.5 text-xs">
        {slices.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs"
              style={{ background: entry.fill }}
            />
            <span className="text-muted-foreground">{entry.label}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{format(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Multi-series stacked bar (categorical). Legend always shown. */
export function StackedBar({
  data,
  keys,
  height = 260,
  valueFormat = "number",
}: {
  data: Record<string, string | number>[];
  keys: SeriesKey[];
  height?: number;
  valueFormat?: ValueFormat;
}) {
  const mounted = useMounted();
  const format = makeFormatter(valueFormat);
  const fmt = (value: unknown) => format(toNum(value));

  if (!mounted) return <div style={{ height }} aria-hidden />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" tick={AXIS_TICK} stroke={CHART.axis} interval={0} />
        <YAxis tick={AXIS_TICK} stroke={CHART.axis} tickFormatter={fmt} width={44} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={cursorFill} formatter={fmt} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        {keys.map((series, index) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.name}
            stackId="a"
            fill={seriesColor(index)}
            stroke="var(--card)"
            strokeWidth={2}
            maxBarSize={44}
            isAnimationActive={false}
            radius={index === keys.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
