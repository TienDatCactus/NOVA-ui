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
  "A stacked bar chart comparing room availability across types";

const chartConfig = {
  available: {
    label: "Phòng trống",
    color: "var(--chart-1)", // green
  },
  booked: {
    label: "Đã đặt",
    color: "var(--chart-2)", // blue
  },
  checkin: {
    label: "Đang ở",
    color: "var(--chart-3)", // amber
  },
} satisfies ChartConfig;

interface BookingRadarChartProps {
  className?: string;
  data?: Array<{
    type: string;
    available: number;
    booked: number;
    checkin: number;
  }>;
}

export function BookingRadarChart({ className, data }: BookingRadarChartProps) {
  const chartData = data || [];

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>Tình trạng phòng theo hạng</CardTitle>
        <CardDescription>
          So sánh số lượng phòng trống, đã đặt và đang ở theo từng hạng phòng
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="type"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "var(--foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                label={{
                  value: "Số lượng phòng",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "var(--muted-foreground)" },
                }}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="available"
                stackId="a"
                fill="#10ff33"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="booked"
                stackId="a"
                fill="#3341ff"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="checkin"
                stackId="a"
                fill="#eeff33"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Tổng quan tình trạng phòng theo hạng
        </div>
        <div className="leading-none text-muted-foreground">
          Biểu đồ cột chồng hiển thị phân bố phòng trống, đã đặt và đang sử dụng
        </div>
      </CardFooter>
    </Card>
  );
}
