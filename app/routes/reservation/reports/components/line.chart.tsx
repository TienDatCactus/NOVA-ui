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
import { cn } from "~/lib/utils";

export const description =
  "A line chart showing available rooms trend by room type";

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

interface BookingLineChartProps {
  className?: string;
  data?: Array<Record<string, string | number>>;
}

export function BookingLineChart({ className, data }: BookingLineChartProps) {
  const chartData = data || [];

  const roomTypes =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((key) => key !== "date")
      : [];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Xu hướng phòng trống theo hạng phòng</CardTitle>
        <CardDescription>
          So sánh số lượng phòng trống giữa các hạng phòng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer className="h-[350px]" config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
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
              {roomTypes.map((roomType) => (
                <Line
                  key={roomType}
                  dataKey={roomType}
                  type="monotone"
                  stroke={`var(${roomType})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <legend className="text-muted-foreground leading-none text-sm italic">
          *Biểu đồ hiển thị xu hướng phòng trống theo từng hạng phòng để phát
          hiện hạng phòng nào đang dư/giảm
        </legend>
      </CardFooter>
    </Card>
  );
}
