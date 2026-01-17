import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney } from "~/lib/utils";

interface BookingDataItem {
  date: string;
  booked: number;
  checkin: number;
  checkout: number;
  available: number;
  inhouse: number;
}

interface BookingTrendChartProps {
  data: BookingDataItem[];
}

const COLORS = {
  available: "var(--chart-1)", // Primary blue
  booked: "var(--chart-2)", // Lighter blue
  checkin: "var(--chart-3)", // Darker blue
  checkout: "var(--chart-4)", // Purple-blue
  inhouse: "var(--chart-5)", // Teal
};

export function BookingTrendChart({ data }: BookingTrendChartProps) {
  const chartData = data.map((item) => {
    return {
      date: item.date,
      fullDate: item.date,
      phongtrong: item.available,
      dadat: item.booked,
      checkin: item.checkin,
      checkout: item.checkout,
      inhouse: item.inhouse,
      total: item.available + item.booked,
    };
  });

  const hasData = data.some(
    (d) =>
      d.available > 0 ||
      d.booked > 0 ||
      d.checkin > 0 ||
      d.checkout > 0 ||
      d.inhouse > 0,
  );

  return (
    <Card className="h-full shadow-none border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              Xu hướng đặt phòng
            </CardTitle>
          </div>

          {/* Legend in Header to save vertical space */}
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: "Phòng trống", color: COLORS.available },
              { label: "Đã đặt", color: COLORS.booked },
              { label: "Check-in", color: COLORS.checkin },
              { label: "Check-out", color: COLORS.checkout },
              { label: "Đang ở", color: COLORS.inhouse },
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
          <div className="h-[20rem] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed border-muted">
            <p className="text-sm font-medium">Chưa có dữ liệu phát sinh</p>
          </div>
        ) : (
          <div className="h-[20rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorAvailable"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.available}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.available}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.booked}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.booked}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorCheckin" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.checkin}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.checkin}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorCheckout"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.checkout}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.checkout}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorInhouse" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.inhouse}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.inhouse}
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
                  minTickGap={30}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatMoney(value).vndFormatted}
                />

                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Area
                  type="monotone"
                  dataKey="phongtrong"
                  stackId="1"
                  stroke={COLORS.available}
                  fill="url(#colorAvailable)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.available }}
                />
                <Area
                  type="monotone"
                  dataKey="dadat"
                  stackId="1"
                  stroke={COLORS.booked}
                  fill="url(#colorBooked)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.booked }}
                />
                <Area
                  type="monotone"
                  dataKey="checkin"
                  stackId="1"
                  stroke={COLORS.checkin}
                  fill="url(#colorCheckin)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.checkin }}
                />
                <Area
                  type="monotone"
                  dataKey="checkout"
                  stackId="1"
                  stroke={COLORS.checkout}
                  fill="url(#colorCheckout)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.checkout }}
                />
                <Area
                  type="monotone"
                  dataKey="inhouse"
                  stackId="1"
                  stroke={COLORS.inhouse}
                  fill="url(#colorInhouse)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: COLORS.inhouse }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce(
    (sum: number, item: any) => sum + (item.value || 0),
    0,
  );

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-3 min-w-[10rem] text-xs">
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
                {item.dataKey === "phongtrong"
                  ? "Phòng trống"
                  : item.dataKey === "dadat"
                    ? "Đã đặt"
                    : item.dataKey === "checkin"
                      ? "Check-in"
                      : item.dataKey === "checkout"
                        ? "Check-out"
                        : item.dataKey === "inhouse"
                          ? "Đang ở"
                          : item.dataKey}
              </span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
        <span className="font-semibold text-muted-foreground">Tổng</span>
        <span className="font-bold text-primary font-mono">{total}</span>
      </div>
    </div>
  );
}
