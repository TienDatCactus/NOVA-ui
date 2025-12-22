import { Percent, RotateCcw, Wallet, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { FinancialHealthDto } from "~/services/api/finances/dto";

// --- Configuration ---
// Định nghĩa ngưỡng (Thresholds) tại một nơi để dễ quản lý
const THRESHOLDS = {
  collection: { target: 90, critical: 50 },
  refund: { warning: 5 }, // > 5% là cảnh báo
  discount: { warning: 15 }, // > 15% là cảnh báo
};

// --- Sub-component: Reusable Minimal Stat ---
interface HealthStatProps {
  label: string;
  value: number;
  icon: LucideIcon;
  target?: number; // Dùng cho chỉ số cần đạt được (Collection)
  limit?: number; // Dùng cho chỉ số cần hạn chế (Refund/Discount)
  suffix?: string;
}

function HealthStat({
  label,
  value,
  icon: Icon,
  target,
  limit,
  suffix = "%",
}: HealthStatProps) {
  // Logic phân loại trạng thái (Status Resolution)
  let status: "good" | "warning" | "critical" | "neutral" = "neutral";

  if (target !== undefined) {
    // Logic: Cao là tốt (VD: Thu tiền)
    if (value >= target) status = "good";
    else if (value < THRESHOLDS.collection.critical) status = "critical";
    else status = "warning";
  } else if (limit !== undefined) {
    // Logic: Thấp là tốt (VD: Hoàn tiền, Giảm giá)
    if (value > limit)
      status = "critical"; // Vượt ngưỡng cho phép -> Xấu
    else status = "good"; // Dưới ngưỡng -> Tốt
  }

  // Mapping màu sắc theo biến hệ thống (System Variables)
  const statusStyles = {
    good: "text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
    warning:
      "text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/20",
    critical: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/20",
    neutral: "text-muted-foreground bg-muted/50",
  };

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-border/40">
      <div className="space-y-1">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value.toFixed(1)}
            {suffix}
          </span>
          {/* Context Text: Hiển thị Target hoặc Limit nhỏ bên cạnh */}
          <span className="text-[10px] text-muted-foreground">
            {target
              ? `/ ${target}${suffix}`
              : limit
                ? `(Max ${limit}${suffix})`
                : ""}
          </span>
        </div>
      </div>

      {/* Status Badge: Chỉ hiện icon màu để tối giản */}
      <div className={cn("p-2 rounded-full", statusStyles[status])}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

// --- Main Component ---

interface FinancialHealthIndicatorsProps {
  health: FinancialHealthDto;
  collectionTarget: number;
}

export function FinancialHealthIndicators({
  health,
  collectionTarget,
}: FinancialHealthIndicatorsProps) {
  return (
    <Card className="shadow-none border-border/60">
      <CardContent className="p-4 grid gap-4 md:grid-cols-3">
        {/* 1. Tỷ lệ thu tiền (Cao = Tốt) */}
        <HealthStat
          label="Tỷ lệ thu tiền"
          value={health.collectionRate}
          target={collectionTarget}
          icon={Wallet}
        />

        {/* 2. Tỷ lệ hoàn tiền (Thấp = Tốt) */}
        <HealthStat
          label="Tỷ lệ hoàn tiền"
          value={health.refundRate}
          limit={THRESHOLDS.refund.warning}
          icon={RotateCcw}
        />

        {/* 3. Tỷ lệ giảm giá (Thấp = Tốt) */}
        <HealthStat
          label="Tỷ lệ giảm giá"
          value={health.discountRate}
          limit={THRESHOLDS.discount.warning}
          icon={Percent}
        />
      </CardContent>
    </Card>
  );
}
