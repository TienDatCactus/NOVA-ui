import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Label,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { formatMoney } from "~/lib/utils";
import type {
  RevenueBreakdownItemDto,
  ChannelRevenueDto,
} from "~/services/api/finances/dto";
import { Inbox } from "lucide-react";

// --- System Colors (CSS Variables) ---
// Ensure your globals.css defines these variables (chart-1 to chart-5).
// Fallback logic provided for safety.
const THEME_COLORS: Record<string, string> = {
  Room: "var(--chart-1)",
  FnB: "var(--chart-2)",
  Service: "var(--chart-3)",
  Other: "var(--chart-4)",
  Direct: "var(--chart-1)",
  OTA: "var(--chart-2)",
  WalkIn: "var(--chart-3)",
  Agency: "var(--chart-5)",
  Default: "var(--muted)",
};

// --- Shared Components ---

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground/50 border border-dashed border-border/40 rounded-lg">
      <Inbox className="h-8 w-8 mb-2 opacity-20" />
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

const MinimalTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border/50 rounded-md px-3 py-2 text-xs">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">{data.name}</span>
        <span className="font-mono font-medium text-foreground">
          {formatMoney(data.value || data.amount).vndFormatted}
        </span>
      </div>
    </div>
  );
};

// --- 1. Revenue Donut ---

export function RevenueBreakdownDonut({
  data,
  totalRevenue,
}: {
  data: RevenueBreakdownItemDto[];
  totalRevenue: number;
}) {
  if (!data?.length || totalRevenue === 0) {
    return (
      <Card className="shadow-none border-border/60">
        <CardContent className="p-6">
          <EmptyState label="No Data" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: getTypeLabel(item.type),
    value: item.amount,
    percentage: item.percentage,
    fill: THEME_COLORS[item.type] || THEME_COLORS.Default,
  }));

  return (
    <Card className="flex flex-col h-full shadow-none border-border/60 p-0">
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Cơ cấu doanh thu
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="focus:outline-none"
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 2}
                            className="fill-foreground text-lg font-bold font-mono tracking-tight"
                          >
                            {(totalRevenue / 1000000).toFixed(1)}M
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Tooltip content={<MinimalTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Minimal Grid Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-mono font-medium">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- 2. Channel Bar Chart ---

export function ChannelRevenueChart({ data }: { data: ChannelRevenueDto[] }) {
  if (!data?.length) {
    return (
      <Card className="shadow-none border-border/60">
        <CardContent className="p-6">
          <EmptyState label="No Channel Data" />
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  const dynamicHeight = Math.max(sortedData.length * 40, 200);

  const chartData = sortedData.map((item) => ({
    name: item.channelName,
    amount: item.amount,
    fill: THEME_COLORS[item.channelName] || THEME_COLORS.Default,
  }));

  return (
    <Card className="flex flex-col h-full shadow-none border-border/60  p-0">
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Top kênh doanh thu
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pl-0 min-h-[200px]">
        <div className="w-full">
          <div style={{ height: `${dynamicHeight}px`, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 50, left: 10, bottom: 0 }}
                barSize={16}
                barGap={4}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  // Explicit HSL strings to prevent black fallback
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) =>
                    val.length > 12 ? `${val.substring(0, 12)}...` : val
                  }
                />
                <XAxis type="number" />

                <Tooltip
                  cursor={{
                    fill: "var(--muted)",
                    fillOpacity: 0.1,
                    radius: 4,
                  }}
                  content={<MinimalTooltip />}
                />
                <Bar
                  dataKey="amount"
                  radius={[0, 4, 4, 0]}
                  background={{
                    fill: "var(--muted)",
                    fillOpacity: 0.1,
                    radius: 0,
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="amount"
                    position="right"
                    fill="var(--foreground)"
                    formatter={(val: number) =>
                      (val / 1000000).toFixed(1) + "M"
                    }
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      fontFamily: "monospace",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Room: "Phòng",
    FnB: "F&B",
    Service: "Dịch vụ",
    Other: "Khác",
  };
  return labels[type] || type;
}
