import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { cn, formatMoney } from "~/lib/utils";

interface MonthlyTrendChartProps {
  byMonth: Record<string, number>;
}

const chartConfig = {
  amount: {
    label: "Chi phí",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function MonthlyTrendChart({ byMonth }: MonthlyTrendChartProps) {
  const chartData = Object.entries(byMonth)
    .map(([month, amount]) => ({
      month,
      shortLabel: formatShortMonth(month), // "T01", "T02"
      fullLabel: formatFullMonth(month), // "Tháng 01/2024"
      amount,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // 2. Calculate Trend & Spikes
  const lastMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];

  const trend =
    lastMonth && prevMonth && prevMonth.amount > 0
      ? ((lastMonth.amount - prevMonth.amount) / prevMonth.amount) * 100
      : 0;

  // Calculate average to determine spikes
  const total = chartData.reduce((sum, item) => sum + item.amount, 0);
  const avg = total / (chartData.length || 1);
  const SPIKE_THRESHOLD = avg * 1.5; // Highlight bars 50% above average

  if (chartData.length === 0) {
    return (
      <Card className="shadow-none border bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Xu hướng chi phí
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          Chưa có dữ liệu hiển thị
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-sm  transition-all h-full flex-col flex justify-between hover:bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Biến động theo tháng
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Chi tiêu trong {chartData.length} tháng qua
            </CardDescription>
          </div>

          {/* Trend Badge */}
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
              trend > 0
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            )}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />

            {/* Clean Y-Axis: No lines, just rough scale */}
            <YAxis
              hide
              domain={[0, "dataMax + 10%"]} // Add headroom
            />

            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted)/0.2)" }}
              content={
                <ChartTooltipContent
                  className="bg-background/95 backdrop-blur border shadow-sm"
                  formatter={(value, _, item) => (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className="text-xs text-muted-foreground">
                        {item.payload.fullLabel}
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono text-primary">
                          {formatMoney(Number(value)).vndFormatted}
                        </span>
                        {Number(value) > SPIKE_THRESHOLD && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded">
                            Cao
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  indicator="line"
                />
              }
            />

            <Bar
              dataKey="amount"
              radius={[4, 4, 4, 4]} // Fully rounded bars look friendlier
              maxBarSize={50}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.amount > SPIKE_THRESHOLD
                      ? "var(--destructive)"
                      : "var(--primary)"
                  }
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full justify-between items-center text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div> Bình
              thường
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div> Đột
              biến
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Helpers

// "2025-01" -> "T01" (Compact for X-Axis)
function formatShortMonth(monthKey: string): string {
  const [_, month] = monthKey.split("-");
  if (!month) return monthKey;
  return `T${month}`;
}

// "2025-01" -> "Tháng 01/2025" (Full for Tooltip)
function formatFullMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  if (!year || !month) return monthKey;
  return `Tháng ${month}/${year}`;
}
