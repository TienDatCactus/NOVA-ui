import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";
import { Inbox } from "lucide-react";

interface RoomTypeItem {
  type: string;
  value: number;
}

interface RoomTypeDonutProps {
  data: RoomTypeItem[];
}

// Dynamic color assignment based on index
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function RoomTypeDonut({ data }: RoomTypeDonutProps) {
  const totalRooms = data.reduce((sum, item) => sum + item.value, 0);

  if (!data?.length || totalRooms === 0) {
    return (
      <Card className="shadow-none border-border/60">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-base font-semibold tracking-tight">
            Phòng trống theo loại
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

  const chartData = data.map((item, index) => ({
    name: item.type,
    value: item.value,
    percentage: (item.value / totalRooms) * 100,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card className="flex flex-col h-full shadow-none border-border/60 p-0">
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-base font-semibold tracking-tight">
          Phòng trống theo loại
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex justify-between pb-4">
        <div className="h-full w-full">
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
                            y={(viewBox.cy || 0) - 8}
                            className="fill-muted-foreground text-xs"
                          >
                            Tổng
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-foreground text-2xl font-bold font-mono tracking-tight"
                          >
                            {totalRooms}
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

const MinimalTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border/50 rounded-md px-3 py-2 text-xs shadow-xl">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-foreground">{data.name}</span>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Số phòng:</span>
          <span className="font-mono font-medium text-foreground">
            {data.value}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Tỷ lệ:</span>
          <span className="font-mono font-medium text-foreground">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
