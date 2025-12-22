import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  value: number | string;
  subtitle?: string;
  format?: "number" | "percent";
  className?: string;
}

export function KpiCard({
  title,
  icon: Icon,
  value,
  subtitle,
  format = "number",
  className,
}: KpiCardProps) {
  const displayValue =
    format === "percent"
      ? `${typeof value === "number" ? value.toFixed(1) : value}%`
      : typeof value === "number"
        ? value.toLocaleString("vi-VN")
        : value;

  return (
    <Card className={cn("shadow-none border-border/60 p-0", className)}>
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

          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
