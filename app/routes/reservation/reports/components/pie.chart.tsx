"use client";

import { Pie, PieChart, Cell, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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

// Snapshot phòng trống theo hạng phòng cho ngày 01/12/2024
const availableRoomsByType = [
  { type: "Traditional", value: 8, fill: "#3b82f6" }, // blue
  { type: "Romantic", value: 5, fill: "#ec4899" }, // pink
  { type: "Unique", value: 4, fill: "#8b5cf6" }, // purple
  { type: "Chalet", value: 3, fill: "#f59e0b" }, // amber
];

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

export function BookingPieChart({ className }: { className?: string }) {
  const totalRooms = availableRoomsByType.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Phân bổ phòng trống theo hạng phòng</CardTitle>
        <CardDescription>
          Ngày 01/12/2024 - Tổng: {totalRooms} phòng
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={availableRoomsByType}
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
              {availableRoomsByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = availableRoomsByType.find((d) => d.type === value);
                return `${value}: ${item?.value || 0} phòng`;
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
