"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  "A stacked bar chart showing daily room status breakdown";

const bookingData = [
  { date: "01/12", booked: 6, checkin: 3, checkout: 2, available: 5 },
  { date: "02/12", booked: 5, checkin: 4, checkout: 3, available: 4 },
  { date: "03/12", booked: 7, checkin: 2, checkout: 4, available: 3 },
  { date: "04/12", booked: 4, checkin: 5, checkout: 2, available: 5 },
  { date: "05/12", booked: 6, checkin: 3, checkout: 3, available: 4 },
  { date: "06/12", booked: 5, checkin: 4, checkout: 2, available: 5 },
  { date: "07/12", booked: 8, checkin: 2, checkout: 1, available: 5 },
];

const chartConfig = {
  booked: {
    label: "Đã đặt",
    color: "#3b82f6", // blue
  },
  checkin: {
    label: "Check-in",
    color: "#22c55e", // green
  },
  checkout: {
    label: "Check-out",
    color: "#facc15", // yellow
  },
  available: {
    label: "Phòng trống",
    color: "#e5e7eb", // gray
  },
} satisfies ChartConfig;

export function BookingStackedBarChart({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tình trạng phòng theo ngày</CardTitle>
        <CardDescription>
          Biểu đồ phân bổ trạng thái phòng hàng ngày
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={bookingData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="available"
              stackId="a"
              fill="var(--color-available)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="booked"
              stackId="a"
              fill="var(--color-booked)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="checkin"
              stackId="a"
              fill="var(--color-checkin)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="checkout"
              stackId="a"
              fill="var(--color-checkout)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-muted-foreground">
          Tổng số phòng được phân bổ theo trạng thái từng ngày
        </div>
      </CardFooter>
    </Card>
  );
}
