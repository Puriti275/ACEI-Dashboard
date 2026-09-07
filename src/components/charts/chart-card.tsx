import { Card } from "@/components/ui/card";

export type ChartTable = {
  columns: string[];
  rows: (string | number)[][];
};

/**
 * Shell for every chart on the dashboard: title, optional subtitle, the plot,
 * and a collapsible data table (the accessibility fallback — always present when
 * a table is passed).
 */
export function ChartCard({
  title,
  subtitle,
  children,
  table,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  table?: ChartTable;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex flex-col gap-0.5 border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="px-2 py-3">{children}</div>
      {table && table.rows.length > 0 && (
        <details className="group border-t border-border px-5 py-2 text-xs">
          <summary className="cursor-pointer list-none text-muted-foreground marker:content-none hover:text-foreground">
            <span className="group-open:hidden">Show data table</span>
            <span className="hidden group-open:inline">Hide data table</span>
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {table.columns.map((column, index) => (
                    <th
                      key={column}
                      className={
                        "border-b border-border py-1.5 pr-4 font-medium text-muted-foreground " +
                        (index === 0 ? "" : "text-right tabular-nums")
                      }
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={
                          "border-b border-border/60 py-1.5 pr-4 " +
                          (cellIndex === 0 ? "" : "text-right tabular-nums")
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  );
}

export function ChartEmpty({ message = "No data yet." }: { message?: string }) {
  return (
    <div className="grid h-[220px] place-items-center px-5 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
