import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  comparison?: number;
  variancePercent?: number;
  format?: "currency" | "percent" | "number";
  isInverted?: boolean; // true if lower is better (e.g., discount rate)
  subtitle?: string;
}

export function KpiCard({
  title,
  value,
  comparison,
  variancePercent,
  format = "currency",
  isInverted = false,
  subtitle,
}: KpiCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return `${val.toLocaleString("vi-VN")} đ`;
      case "percent":
        return `${val.toFixed(1)}%`;
      case "number":
        return val.toLocaleString("vi-VN");
      default:
        return val.toString();
    }
  };

  const hasVariance = variancePercent !== undefined && variancePercent !== 0;
  const isPositive = isInverted
    ? (variancePercent || 0) < 0
    : (variancePercent || 0) > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {hasVariance && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium mt-2",
              isPositive ? "text-green-600" : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            <span>{Math.abs(variancePercent).toFixed(1)}%</span>
            {comparison !== undefined && (
              <span className="text-muted-foreground ml-1">
                ({formatValue(comparison)})
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
