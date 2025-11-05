import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
  "A radar chart comparing room types across multiple metrics";

const chartConfig = {
  available: {
    label: "% Phòng trống",
    color: "#22c55e", // green
  },
  booked: {
    label: "% Đã đặt",
    color: "#3b82f6", // blue
  },
  checkin: {
    label: "% Check-in",
    color: "#f59e0b", // amber
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
  // Use provided data or fallback to empty array
  const chartData = data || [];

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>So sánh hiệu suất hạng phòng</CardTitle>
        <CardDescription>
          Phân tích tỷ lệ phòng trống, đặt phòng và check-in theo từng hạng
          phòng
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            Không có dữ liệu
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <RadarChart data={chartData}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <PolarAngleAxis
                dataKey="type"
                tick={{ fill: "var(--foreground)", fontSize: 12 }}
              />
              <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
              <Radar
                name="% Phòng trống"
                dataKey="available"
                stroke="var(--color-available)"
                fill="var(--color-available)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="% Đã đặt"
                dataKey="booked"
                stroke="var(--color-booked)"
                fill="var(--color-booked)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="% Check-in"
                dataKey="checkin"
                stroke="var(--color-checkin)"
                fill="var(--color-checkin)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <legend className="text-muted-foreground leading-none text-sm italic">
          *Biểu đồ hiển thị hiệu suất các hạng phòng dựa trên tỷ lệ phòng trống,
          đặt phòng và check-in
        </legend>
      </CardFooter>
    </Card>
  );
}
