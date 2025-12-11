import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { RevenueTrendDto } from "~/services/api/finances/dto";
import { AlertCircle } from "lucide-react";

interface RevenueTrendChartProps {
  data: RevenueTrendDto[];
}

// Màu sắc nhẹ nhàng hơn, phù hợp business dashboard
const COLORS = {
  room: "#3b82f6", // Blue 500
  fnb: "#f97316", // Orange 500
  service: "#10b981", // Emerald 500
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), "dd/MM", { locale: vi }),
    fullDate: item.date,
    phong: item.roomRevenue,
    fnb: item.fnBRevenue,
    dichvu: item.serviceRevenue,
    tong: item.totalRevenue,
  }));

  const hasData = data.some((d) => d.totalRevenue > 0);
  const sampleSize = data.length;

  return (
    <Card className="h-full shadow-none border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              Xu hướng doanh thu
            </CardTitle>
            {sampleSize < 7 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md border border-amber-100">
                <AlertCircle className="h-3 w-3" />
                <span>Dữ liệu &lt; 7 ngày</span>
              </div>
            )}
          </div>

          {/* Moved Legend to Header to save vertical space */}
          <div className="flex items-center gap-4">
            {[
              { label: "Phòng", color: COLORS.room },
              { label: "F&B", color: COLORS.fnb },
              { label: "Dịch vụ", color: COLORS.service },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div
                  className="h-2 w-2 rounded-full ring-2 ring-transparent"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
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
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPhong" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.room}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.room}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorFnb" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.fnb}
                      stopOpacity={0.2}
                    />
                    <stop offset="95%" stopColor={COLORS.fnb} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDichvu" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.service}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.service}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                {/* Grid: Horizontal only, very light */}
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
                  minTickGap={30} // Prevent overlapping dates
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

                {/* Stroke width reduced to 2 for elegance */}
                <Area
                  type="monotone"
                  dataKey="phong"
                  stackId="1"
                  stroke={COLORS.room}
                  fill="url(#colorPhong)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.room }}
                />
                <Area
                  type="monotone"
                  dataKey="fnb"
                  stackId="1"
                  stroke={COLORS.fnb}
                  fill="url(#colorFnb)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.fnb }}
                />
                <Area
                  type="monotone"
                  dataKey="dichvu"
                  stackId="1"
                  stroke={COLORS.service}
                  fill="url(#colorDichvu)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.service }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tooltip tối giản, giống style của KpiCard
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce(
    (sum: number, item: any) => sum + (item.value || 0),
    0
  );

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
              <span className="text-muted-foreground capitalize">
                {item.dataKey === "phong"
                  ? "Phòng"
                  : item.dataKey === "fnb"
                    ? "F&B"
                    : "Dịch vụ"}
              </span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(item.value || 0).vndFormatted}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="font-semibold text-muted-foreground">Tổng</span>
        <span className="font-bold text-primary font-mono">
          {formatMoney(total).vndFormatted}
        </span>
      </div>
    </div>
  );
}
