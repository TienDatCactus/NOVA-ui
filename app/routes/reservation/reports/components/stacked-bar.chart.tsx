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

interface BookingStackedBarChartProps {
  className?: string;
  data?: Array<{
    date: string;
    booked: number;
    checkin: number;
    checkout: number;
    available: number;
  }>;
}

export function BookingStackedBarChart({
  className,
  data,
}: BookingStackedBarChartProps) {
  // Use provided data or fallback to empty array
  const chartData = data || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tình trạng phòng theo ngày</CardTitle>
        <CardDescription>
          Biểu đồ phân bổ trạng thái phòng hàng ngày
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
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
        )}
      </CardContent>
      <CardFooter>
        <legend className="text-muted-foreground leading-none text-sm italic">
          * Tổng số phòng được phân bổ theo trạng thái từng ngày
        </legend>
      </CardFooter>
    </Card>
  );
}
