import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { ChartConfig } from "~/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import type {
  RevenueBreakdownItemDto,
  ChannelRevenueDto,
} from "~/services/api/finances/dto";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface RevenueBreakdownSectionProps {
  revenueBreakdown?: RevenueBreakdownItemDto[];
  revenueByChannel?: ChannelRevenueDto[];
}

const revenueTypeColors: Record<string, string> = {
  Room: "var(--chart-1)",
  FnB: "var(--chart-2)",
  Service: "var(--chart-3)",
  Other: "var(--chart-4)",
};

export function RevenueBreakdownSection({
  revenueBreakdown = [],
  revenueByChannel = [],
}: RevenueBreakdownSectionProps) {
  const totalRevenue = revenueBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const chartConfig: ChartConfig = {
    Room: { label: "Phòng", color: revenueTypeColors.Room },
    FnB: { label: "Ăn uống", color: revenueTypeColors.FnB },
    Service: { label: "Dịch vụ", color: revenueTypeColors.Service },
    Other: { label: "Khác", color: revenueTypeColors.Other },
  };

  const pieData = revenueBreakdown.map((item) => ({
    name: item.name,
    value: item.amount,
    fill: revenueTypeColors[item.type] || revenueTypeColors.Other,
  }));

  const barData = [...revenueByChannel]
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      channel: item.channelName,
      amount: item.amount,
      count: item.bookingCount,
    }));

  return (
    <div className="space-y-6">
      {/* Revenue by Type - Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo loại</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
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
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {totalRevenue.toLocaleString("vi-VN")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            đồng
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {revenueBreakdown.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: revenueTypeColors[item.type] }}
                />
                <span className="text-sm">
                  {item.name}: {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Channel - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo kênh</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: { label: "Doanh thu", color: "var(--chart-1)" },
            }}
            className="h-[250px] w-full"
          >
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="channel" type="category" width={80} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value, payload) => {
                      const item = payload[0]?.payload;
                      return `${value} (${item?.count || 0} đặt phòng)`;
                    }}
                  />
                }
              />
              <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
