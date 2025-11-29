import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { ChartConfig } from "~/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { RevenueTrendDto } from "~/services/api/finances/dto";
import { format, parseISO } from "date-fns";

interface RevenueTrendSectionProps {
  data?: RevenueTrendDto[];
}

const chartConfig: ChartConfig = {
  totalRevenue: {
    label: "Tổng doanh thu",
    color: "hsl(var(--chart-1))",
  },
  roomRevenue: {
    label: "Doanh thu phòng",
    color: "hsl(var(--chart-2))",
  },
  fnBRevenue: {
    label: "Doanh thu F&B",
    color: "hsl(var(--chart-3))",
  },
  serviceRevenue: {
    label: "Doanh thu dịch vụ",
    color: "hsl(var(--chart-4))",
  },
};

export function RevenueTrendSection({ data = [] }: RevenueTrendSectionProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.date), "dd/MM"),
    totalRevenue: item.totalRevenue,
    roomRevenue: item.roomRevenue,
    fnBRevenue: item.fnBRevenue,
    serviceRevenue: item.serviceRevenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xu hướng doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="var(--color-totalRevenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="roomRevenue"
              stroke="var(--color-roomRevenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fnBRevenue"
              stroke="var(--color-fnBRevenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="serviceRevenue"
              stroke="var(--color-serviceRevenue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
