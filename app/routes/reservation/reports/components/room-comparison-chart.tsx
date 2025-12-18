import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Inbox } from "lucide-react";

interface RoomComparisonItem {
  type: string;
  available: number;
  booked: number;
  checkin: number;
}

interface RoomComparisonChartProps {
  data: RoomComparisonItem[];
}

const COLORS = {
  available: "var(--chart-1)", // Blue
  booked: "var(--chart-2)", // Lighter blue
  checkin: "var(--chart-3)", // Darker blue
};

export function RoomComparisonChart({ data }: RoomComparisonChartProps) {
  if (!data?.length) {
    return (
      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            So sánh theo loại phòng
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground/50 border border-dashed border-border/40 rounded-lg">
            <Inbox className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-wide">
              Không có dữ liệu
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-none border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          So sánh theo loại phòng
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="availableGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS.available}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.available}
                    stopOpacity={0.6}
                  />
                </linearGradient>
                <linearGradient id="bookedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.booked}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.booked}
                    stopOpacity={0.6}
                  />
                </linearGradient>
                <linearGradient
                  id="checkinGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS.checkin}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.checkin}
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.4}
              />

              <XAxis
                dataKey="type"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString("vi-VN")}
              />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    available: "Phòng trống",
                    booked: "Đã đặt",
                    checkin: "Check-in",
                  };
                  return labels[value] || value;
                }}
              />

              <Bar
                dataKey="available"
                fill="url(#availableGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="booked"
                fill="url(#bookedGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="checkin"
                fill="url(#checkinGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                {item.dataKey === "available"
                  ? "Phòng trống"
                  : item.dataKey === "booked"
                    ? "Đã đặt"
                    : "Check-in"}
              </span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
