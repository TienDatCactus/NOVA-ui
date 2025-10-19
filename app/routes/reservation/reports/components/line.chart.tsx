"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export const description =
  "A line chart showing available rooms trend by room type";

// Xu hướng phòng trống theo hạng phòng
const availableRoomsTrendData = [
  { date: "01/12", Traditional: 8, Romantic: 5, Unique: 4, Chalet: 3 },
  { date: "02/12", Traditional: 7, Romantic: 4, Unique: 5, Chalet: 4 },
  { date: "03/12", Traditional: 6, Romantic: 6, Unique: 3, Chalet: 2 },
  { date: "04/12", Traditional: 9, Romantic: 3, Unique: 4, Chalet: 4 },
  { date: "05/12", Traditional: 7, Romantic: 5, Unique: 5, Chalet: 3 },
  { date: "06/12", Traditional: 8, Romantic: 4, Unique: 4, Chalet: 5 },
  { date: "07/12", Traditional: 6, Romantic: 6, Unique: 3, Chalet: 2 },
];

const chartConfig = {
  Traditional: {
    label: "Traditional",
    color: "#3b82f6", // blue
  },
  Romantic: {
    label: "Romantic",
    color: "#ec4899", // pink
  },
  Unique: {
    label: "Unique",
    color: "#8b5cf6", // purple
  },
  Chalet: {
    label: "Chalet",
    color: "#f59e0b", // amber
  },
} satisfies ChartConfig;

export function BookingLineChart({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Xu hướng phòng trống theo hạng phòng</CardTitle>
        <CardDescription>
          So sánh số lượng phòng trống giữa các hạng phòng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[350px]" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={availableRoomsTrendData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="Traditional"
              type="monotone"
              stroke="var(--color-Traditional)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="Romantic"
              type="monotone"
              stroke="var(--color-Romantic)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="Unique"
              type="monotone"
              stroke="var(--color-Unique)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="Chalet"
              type="monotone"
              stroke="var(--color-Chalet)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Biểu đồ hiển thị xu hướng phòng trống theo từng hạng phòng để phát
              hiện hạng phòng nào đang dư/giảm
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
