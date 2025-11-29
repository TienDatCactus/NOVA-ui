import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type ReactNode } from "react";

interface KpiCardProps {
  title: string;
  icon?: ReactNode; // ✨ NEW: Hỗ trợ Icon
  value: number | string;

  // Variance / Trend Props
  comparison?: number;
  variancePercent?: number;
  trendLabel?: string; // ✨ NEW: Label cho so sánh (VD: "so với tháng trước")
  isInverted?: boolean; // true nếu thấp hơn là tốt (VD: Tỷ lệ hủy phòng)

  // Formatting & Styling
  format?: "currency" | "percent" | "number" | "decimal";
  subtitle?: string;
  className?: string; // ✨ NEW: Để custom style (VD: đổi màu nền)
}

export function KpiCard({
  title,
  icon,
  value,
  comparison,
  variancePercent,
  trendLabel = "so với kỳ trước",
  format = "currency",
  isInverted = false,
  subtitle,
  className,
}: KpiCardProps) {
  // 1. Helper Format số liệu chuẩn Quốc tế/Việt Nam
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(val);
      case "percent":
        return new Intl.NumberFormat("vi-VN", {
          style: "percent",
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        }).format(val / 100); // Lưu ý: Intl thường nhận 0.1 là 10%
      case "decimal": // Số thập phân (VD: 4.5 sao)
        return new Intl.NumberFormat("vi-VN", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        }).format(val);
      case "number":
      default:
        return new Intl.NumberFormat("vi-VN").format(val);
    }
  };

  // 2. Logic xác định màu sắc xu hướng
  const hasVariance = variancePercent !== undefined;
  const isZero = variancePercent === 0;

  // Nếu Inverted = true (VD: Chi phí), thì Tăng (>0) là Xấu (Đỏ), Giảm (<0) là Tốt (Xanh)
  // Ngược lại (VD: Doanh thu), Tăng là Tốt (Xanh), Giảm là Xấu (Đỏ)
  const isPositiveTrend = isInverted
    ? (variancePercent || 0) < 0
    : (variancePercent || 0) > 0;

  const trendColor = isZero
    ? "text-muted-foreground"
    : isPositiveTrend
      ? "text-green-600 dark:text-green-500"
      : "text-red-600 dark:text-red-500";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {/* Render Icon nếu có */}
        {icon && (
          <div className="h-4 w-4 text-muted-foreground opacity-70">{icon}</div>
        )}
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {/* Xử lý riêng trường hợp percent để hiển thị đúng format số truyền vào */}
          {format === "percent" && typeof value === "number"
            ? `${value.toFixed(1)}%` // Fallback thủ công nếu value là 85 thay vì 0.85
            : formatValue(value)}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}

        {/* Trend Section */}
        {hasVariance && (
          <div className="mt-2 flex items-center text-xs">
            <span className={cn("flex items-center font-medium", trendColor)}>
              {isZero ? (
                <Minus className="mr-1 h-3 w-3" />
              ) : (variancePercent || 0) > 0 ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {Math.abs(variancePercent || 0).toFixed(1)}%
            </span>

            <span className="ml-2 text-muted-foreground truncate">
              {comparison !== undefined
                ? `${trendLabel} (${formatValue(comparison)})`
                : trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
