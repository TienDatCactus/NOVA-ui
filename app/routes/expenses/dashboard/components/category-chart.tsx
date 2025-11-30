import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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
import { formatMoney } from "~/lib/utils";

interface CategoryChartProps {
  byCategory: Record<string, number>;
  totalAmount: number;
  onCategoryClick?: (category: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Procurement: "Mua sắm",
  Salary: "Lương",
  Utilities: "Tiện ích",
  Maintenance: "Bảo trì",
  Marketing: "Marketing",
  Office: "Văn phòng",
  Other: "Khác",
};

// Using CSS variables for theme consistency
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const OVERSPENDING_THRESHOLD = 25;

export default function CategoryChart({
  byCategory,
  totalAmount,
  onCategoryClick,
}: CategoryChartProps) {
  // 1. Transform Data
  const chartData = React.useMemo(() => {
    return Object.entries(byCategory)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount], index) => {
        const percentage = (amount / totalAmount) * 100;
        const isOverspending = percentage > OVERSPENDING_THRESHOLD;

        return {
          category,
          categoryName: CATEGORY_LABELS[category] || category,
          amount,
          percentage,
          fill: isOverspending
            ? "var(--destructive)"
            : `${CHART_COLORS[index % CHART_COLORS.length]}`,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [byCategory, totalAmount]);

  // 2. Generate Config for Shadcn Chart
  const chartConfig = React.useMemo(() => {
    return chartData.reduce((config, item) => {
      config[item.category] = {
        label: item.categoryName,
        color: item.fill,
      };
      return config;
    }, {} as ChartConfig);
  }, [chartData]);

  // 3. Empty State
  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col shadow-sm h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Phân bố chi phí</CardTitle>
          <CardDescription>Chưa có dữ liệu ghi nhận</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-[250px]">
          <div className="h-32 w-32 rounded-full border-4 border-muted border-dashed flex items-center justify-center text-muted-foreground text-xs">
            No Data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-sm border-0 sm:border">
      <CardHeader className="items-center pb-0">
        <CardTitle>Phân bố chi phí</CardTitle>
        <CardDescription>Theo danh mục chi tiêu</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-48"
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.payload.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="font-mono font-bold text-primary">
                        {formatMoney(Number(value)).vndFormatted}
                      </div>
                    </div>
                  )}
                />
              }
            />

            {/* THE DONUT */}
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="categoryName"
              innerRadius={65} // Creates the donut hole
              outerRadius={100}
              strokeWidth={4}
              onClick={(data) => onCategoryClick?.(data.category)}
              className="cursor-pointer transition-all hover:opacity-80"
            >
              {/* Center Label */}
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
                          className="fill-foreground text-2xl font-bold font-mono"
                        >
                          {/* Simplified format for center (e.g. 150M) to fit */}
                          {totalAmount > 1000000
                            ? `${(totalAmount / 1000000).toFixed(1)}M`
                            : formatMoney(totalAmount).vndFormatted}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs uppercase tracking-wider"
                        >
                          Tổng chi
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Custom Legend Footer */}
      <div className="grid grid-cols-2 gap-4 p-6 pt-2">
        {chartData.slice(0, 6).map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onCategoryClick?.(item.category)}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0 transition-transform group-hover:scale-125"
              style={{ backgroundColor: item.fill }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {item.categoryName}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
        {chartData.length > 6 && (
          <div className="col-span-2 text-center text-xs text-muted-foreground pt-2">
            + {chartData.length - 6} danh mục khác
          </div>
        )}
      </div>
    </Card>
  );
}
