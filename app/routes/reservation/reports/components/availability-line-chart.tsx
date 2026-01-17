import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Inbox } from "lucide-react";
import { formatMoney } from "~/lib/utils";

interface AvailabilityLineChartProps {
  data: Array<Record<string, string | number>>;
}

export function AvailabilityLineChart({ data }: AvailabilityLineChartProps) {
  if (!data?.length) {
    return (
      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Xu hướng phòng trống
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

  // Transform data - assuming first key is date, rest are room counts
  const chartData = data.map((item) => {
    const entries = Object.entries(item);
    const dateEntry = entries[0];
    const valueEntries = entries.slice(1);

    return {
      date: dateEntry[1] as string,
      ...Object.fromEntries(valueEntries),
    };
  });

  // Get the data key (assuming single series for available rooms trend)
  const dataKeys = Object.keys(chartData[0] || {}).filter(
    (key) => key !== "date",
  );
  const primaryKey = dataKeys[0] || "value";

  return (
    <Card className="h-full shadow-none border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          Xu hướng phòng trống
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 sm:px-6 pb-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--chart-1)" />
                  <stop offset="100%" stopColor="var(--chart-2)" />
                </linearGradient>
              </defs>

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

              <Line
                type="monotone"
                dataKey={primaryKey}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: "var(--chart-1)",
                  strokeWidth: 2,
                  stroke: "var(--background)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-3 min-w-[140px] text-xs">
      <div className="mb-2 pb-2 border-b border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Phòng trống:</span>
        <span className="font-mono font-bold text-primary">
          {payload[0]?.value}
        </span>
      </div>
    </div>
  );
}
