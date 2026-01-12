import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney } from "~/lib/utils";
import type { SimpleTrendPointDto } from "~/services/api/finances/dto";

interface RevenueTrendChartProps {
  data: SimpleTrendPointDto[];
}

// SME Simplified: 2 lines (Revenue vs Expense)
const COLORS = {
  revenue: "var(--chart-1)", // Blue
  expense: "var(--chart-2)", // Red/Orange
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), "dd/MM", { locale: vi }),
    fullDate: item.date,
    revenue: item.revenue,
    expense: item.expense,
  }));

  const hasData = data.some((d) => d.revenue > 0 || d.expense > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold tracking-tight">
            Xu hướng doanh thu
          </CardTitle>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS.revenue }}
              />
              <span className="text-xs font-medium">Doanh thu</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS.expense }}
              />
              <span className="text-xs font-medium">Chi phí</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 pb-6">
        {!hasData ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed border-muted">
            <p className="text-sm font-medium">Chưa có dữ liệu phát sinh</p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000000)
                      return `${(value / 1000000000).toFixed(1)}B`;
                    if (value >= 1000000)
                      return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value;
                  }}
                />

                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.revenue}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke={COLORS.expense}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.expense, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-3 min-w-[160px] text-xs">
      <div className="mb-2 pb-2 border-b border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
      </div>

      <div className="space-y-1.5">
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.dataKey === "revenue" ? "Doanh thu" : "Chi phí"}
              </span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(item.value || 0).vndFormatted}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
