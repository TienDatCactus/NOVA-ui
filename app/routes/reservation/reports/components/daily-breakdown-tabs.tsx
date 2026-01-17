import { Inbox } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";

interface DailyAvailabilityItem {
  date: string;
  available: Record<string, number>;
  booked: Record<string, number>;
  checkin: Record<string, number>;
  checkout: Record<string, number>;
}

interface DailyBreakdownTabsProps {
  data: DailyAvailabilityItem[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DailyBreakdownTabs({ data }: DailyBreakdownTabsProps) {
  if (!data?.length) {
    return (
      <Card className="shadow-none border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight">
            Phân tích chi tiết theo ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground/50 border border-dashed border-border/40 rounded-lg">
            <Inbox className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-wide">
              Không có dữ liệu
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract room types from first item
  const roomTypes = Object.keys(data[0]?.available || {});

  // Transform data for each tab
  const transformData = (statusKey: keyof DailyAvailabilityItem) => {
    return data
      .map((item) => {
        const statusData = item[statusKey];
        if (typeof statusData === "string") return null;

        return {
          fullDate: item.date,
          ...(statusData as Record<string, number>),
        };
      })
      .filter(Boolean);
  };

  const availableData = transformData("available");
  const bookedData = transformData("booked");
  const checkinData = transformData("checkin");
  const checkoutData = transformData("checkout");

  const renderChart = (chartData: any[]) => (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
            opacity={0.4}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={30}
          />

          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatMoney(value).vndFormatted}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconType="line"
            iconSize={12}
          />

          {roomTypes.map((roomType, index) => (
            <Line
              key={roomType}
              type="monotone"
              dataKey={roomType}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
          Phân tích chi tiết theo ngày
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="available">Phòng trống</TabsTrigger>
            <TabsTrigger value="booked">Đã đặt</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="checkout">Check-out</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-0">
            {renderChart(availableData)}
          </TabsContent>

          <TabsContent value="booked" className="mt-0">
            {renderChart(bookedData)}
          </TabsContent>

          <TabsContent value="checkin" className="mt-0">
            {renderChart(checkinData)}
          </TabsContent>

          <TabsContent value="checkout" className="mt-0">
            {renderChart(checkoutData)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-xl rounded-lg p-3 min-w-[180px] text-xs">
      <div className="mb-2 pb-2 border-b border-border/50">
        <p className="font-semibold text-foreground">{label}</p>
      </div>

      <div className="space-y-1.5">
        {payload.map((item: any) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.dataKey}</span>
            </div>
            <span className="font-mono font-medium text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
