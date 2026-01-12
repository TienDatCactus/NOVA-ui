import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney } from "~/lib/utils";
import type { RevenueStructureDto } from "~/services/api/finances/dto";

interface RevenueStructureChartProps {
  data: RevenueStructureDto[];
}

// SME Simplified: 2 categories only
const COLORS = {
  "Room Revenue": "var(--chart-1)", // Blue
  "F&B & Services": "var(--chart-2)", // Orange
};

export function RevenueStructureChart({ data }: RevenueStructureChartProps) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
  const { vndFormatted } = formatMoney(totalRevenue);
  const hasData = totalRevenue > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Cơ cấu doanh thu
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed border-muted">
            <p className="text-sm font-medium">Chưa có dữ liệu phát sinh</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.name as keyof typeof COLORS] ||
                          "var(--muted)"
                        }
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-muted-foreground font-medium">
                  Tổng DT
                </p>
                <p className="text-lg font-bold text-foreground">
                  {vndFormatted}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {chartData.map((item, idx) => {
                const { vndFormatted } = formatMoney(item.value);
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[item.name as keyof typeof COLORS] ||
                            "var(--muted)",
                        }}
                      />
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {vndFormatted}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
