import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn, formatMoney } from "~/lib/utils";

interface MetricsCardsProps {
  totalAmount: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
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

export default function MetricsCards({
  totalAmount,
  byCategory,
  byMonth,
}: MetricsCardsProps) {
  // --- Logic Calculations (Unchanged) ---
  const monthKeys = Object.keys(byMonth).sort();
  const lastMonth = monthKeys[monthKeys.length - 1];
  const prevMonth = monthKeys[monthKeys.length - 2];
  const currentMonthValue = lastMonth ? byMonth[lastMonth] : 0;
  const prevMonthValue = prevMonth ? byMonth[prevMonth] : 0;

  let trend = 0;
  if (prevMonthValue > 0) {
    trend = ((currentMonthValue - prevMonthValue) / prevMonthValue) * 100;
  }

  const monthCount = monthKeys.length || 1;
  const avgMonthly = totalAmount / monthCount;

  const categoryEntries = Object.entries(byCategory);
  const [highestCategory, highestAmount] = categoryEntries.reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["", 0]
  );
  const highestPercentage =
    totalAmount > 0 ? (highestAmount / totalAmount) * 100 : 0;
  const isHighRisk = highestPercentage > 40;

  const activeCategories = categoryEntries.filter(([, v]) => v > 0).length;
  const totalCategories = Object.keys(CATEGORY_LABELS).length;

  const IconBox = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. TOTAL SPENDING */}
      <Card className="p-5 flex flex-col justify-between shadow-none border bg-card/50 hover:bg-card transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Tổng chi phí
            </p>
            <h3 className="text-2xl font-bold tracking-tight font-mono">
              {formatMoney(totalAmount).vndFormatted}
            </h3>
          </div>
          <IconBox>
            <Wallet className="h-4 w-4" />
          </IconBox>
        </div>
        <div className="mt-4 text-[10px] text-muted-foreground flex items-center gap-1.5">
          <div className="h-1 w-8 rounded-full bg-primary/20">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "100%" }}
            />
          </div>
          <span>Dữ liệu {monthCount} tháng</span>
        </div>
      </Card>

      {/* 2. MONTHLY TREND */}
      <Card className="p-5 flex flex-col justify-between shadow-none border bg-card/50 hover:bg-card transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Tháng hiện tại
            </p>
            <h3 className="text-2xl font-bold tracking-tight font-mono">
              {formatMoney(currentMonthValue).vndFormatted}
            </h3>
          </div>
          <IconBox>
            <TrendingUp className="h-4 w-4" />
          </IconBox>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "flex items-center font-medium",
              trend > 0 ? "text-red-600" : "text-emerald-600"
            )}
          >
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">so với tháng trước</span>
        </div>
      </Card>

      {/* 3. HIGHEST CATEGORY */}
      <Card
        className={cn(
          "p-5 flex flex-col justify-between shadow-none border bg-card/50 hover:bg-card transition-colors",
          isHighRisk && "border-orange-200/60 bg-orange-50/10" // Very subtle warning tint
        )}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1 max-w-[75%]">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              Chiếm tỷ trọng lớn nhất
              {isHighRisk && (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
            </p>
            <h3
              className="text-lg font-bold tracking-tight truncate text-foreground"
              title={CATEGORY_LABELS[highestCategory]}
            >
              {CATEGORY_LABELS[highestCategory] || "N/A"}
            </h3>
          </div>
          <IconBox>
            <CreditCard className="h-4 w-4" />
          </IconBox>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>{formatMoney(highestAmount).vndFormatted}</span>
            <span
              className={cn(
                "font-semibold",
                isHighRisk ? "text-orange-600" : "text-primary"
              )}
            >
              {highestPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={highestPercentage}
            className={cn(
              "h-1 bg-muted",
              isHighRisk ? "bg-orange-500" : "bg-primary/80"
            )}
          />
        </div>
      </Card>

      {/* 4. AVERAGE */}
      <Card className="p-5 flex flex-col justify-between shadow-none border bg-card/50 hover:bg-card transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Trung bình tháng
            </p>
            <h3 className="text-2xl font-bold tracking-tight font-mono break-all">
              {formatMoney(avgMonthly).vndFormatted}
            </h3>
          </div>
          <IconBox>
            <BarChart3 className="h-4 w-4" />
          </IconBox>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground">
              Độ phủ danh mục
            </span>
            <span className="text-[10px] font-mono text-foreground">
              {activeCategories}/{totalCategories}
            </span>
          </div>
          {/* Discrete Dots Visualization */}
          <div className="flex gap-1 h-1">
            {Array.from({ length: totalCategories }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all",
                  i < activeCategories ? "bg-primary/60" : "bg-muted/40"
                )}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
