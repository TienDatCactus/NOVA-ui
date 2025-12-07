import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  comparison?: number; // Giá trị kỳ trước (nếu có)
  variancePercent?: number; // % tăng giảm
  format?: "currency" | "percent" | "number";
  isInverted?: boolean; // True nếu giảm là tốt (ví dụ: Chi phí)
  className?: string;
}

export function KpiCard({
  title,
  icon: Icon,
  value,
  comparison,
  variancePercent,
  format = "number",
  isInverted = false,
  className,
}: KpiCardProps) {
  const isPositive = variancePercent ? variancePercent > 0 : false;
  const isNeutral = variancePercent === 0 || variancePercent === undefined;

  let trendColor = "text-muted-foreground"; // Mặc định trung tính
  let TrendIcon = Minus;

  if (!isNeutral && variancePercent !== undefined) {
    const isGood = isInverted ? !isPositive : isPositive;
    trendColor = isGood ? "text-emerald-600" : "text-red-600";
    TrendIcon = isPositive ? TrendingUp : TrendingDown;
  }

  const displayValue =
    format === "currency"
      ? formatMoney(value).vndFormatted
      : format === "percent"
        ? `${value}%`
        : value.toLocaleString("vi-VN");

  return (
    <Card className={cn("shadow-none border-border/60", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <Icon className="h-4 w-4 text-muted-foreground/70" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {displayValue}
          </div>

          {/* Khu vực so sánh & xu hướng */}
          <div className="flex items-center text-xs">
            {!isNeutral && variancePercent !== undefined ? (
              <span className={cn("flex items-center font-medium", trendColor)}>
                <TrendIcon className="mr-1 h-3 w-3" />
                {Math.abs(variancePercent).toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground font-medium">-</span>
            )}

            {comparison !== undefined && (
              <span className="ml-2 text-muted-foreground">
                so với{" "}
                {format === "currency"
                  ? formatMoney(comparison).vndFormatted
                  : comparison.toLocaleString("vi-VN")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card className="shadow-none border-border/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-3 w-[180px]" />
        </div>
      </CardContent>
    </Card>
  );
}
