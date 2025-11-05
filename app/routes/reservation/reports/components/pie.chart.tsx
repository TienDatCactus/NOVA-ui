import { Pie, PieChart, Cell, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";

export const description =
  "A pie chart showing room distribution by type for a specific date";

const chartConfig = {
  value: {
    label: "Số phòng",
  },
  Traditional: {
    label: "Traditional",
    color: "#3b82f6",
  },
  Romantic: {
    label: "Romantic",
    color: "#ec4899",
  },
  Unique: {
    label: "Unique",
    color: "#8b5cf6",
  },
  Chalet: {
    label: "Chalet",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

// Color palette for dynamic room types
const colorPalette = [
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#22c55e", // green
  "#ef4444", // red
  "#14b8a6", // teal
  "#f97316", // orange
];

interface BookingPieChartProps {
  className?: string;
  data?: Array<{
    type: string;
    value: number;
  }>;
  dateRange?: { from: Date; to: Date };
}

export function BookingPieChart({
  className,
  data,
  dateRange,
}: BookingPieChartProps) {
  // Use provided data or fallback to empty array
  const chartData =
    data?.map((item, index) => ({
      ...item,
      fill: colorPalette[index % colorPalette.length],
    })) || [];

  const totalRooms = chartData.reduce((sum, item) => sum + item.value, 0);

  const dateRangeText = dateRange
    ? `${dateRange.from.toLocaleDateString("vi-VN")} - ${dateRange.to.toLocaleDateString("vi-VN")}`
    : "Chưa chọn khoảng thời gian";

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Phân bổ phòng trống theo hạng phòng</CardTitle>
        <CardDescription>
          {dateRangeText} - Tổng: {totalRooms} phòng
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ type, value, percent }) =>
                  `${type}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: "#888", strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const item = chartData.find((d) => d.type === value);
                  return `${value}: ${item?.value || 0} phòng`;
                }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground italic">
          * Biểu đồ hiển thị phân bổ phòng trống theo từng loại phòng
        </div>
      </CardFooter>
    </Card>
  );
}
