import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import type { FinancialHealthDto } from "~/services/api/finances/dto";

interface FinancialHealthSectionProps {
  health?: FinancialHealthDto;
}

interface HealthMetricProps {
  label: string;
  value: number;
  target: number;
  variance: number;
  isInverted?: boolean;
}

function HealthMetric({
  label,
  value,
  target,
  variance,
  isInverted = false,
}: HealthMetricProps) {
  const percentage = (value / target) * 100;
  const isGood = isInverted ? variance < 0 : variance > 0;
  const statusColor = isGood
    ? "text-green-600"
    : Math.abs(variance) < 5
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${statusColor}`}>
          {value.toFixed(1)}% / {target.toFixed(1)}%
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {isInverted ? "Mục tiêu thấp hơn" : "Mục tiêu cao hơn"}{" "}
        {Math.abs(variance).toFixed(1)}%
      </p>
    </div>
  );
}

export function FinancialHealthSection({
  health,
}: FinancialHealthSectionProps) {
  if (!health) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sức khoẻ tài chính</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <HealthMetric
          label="Tỷ lệ chiết khấu"
          value={health.discountRate}
          target={health.discountRateTarget}
          variance={health.discountRateVariance}
          isInverted
        />
        <HealthMetric
          label="Tỷ lệ hoàn tiền"
          value={health.refundRate}
          target={health.refundRateTarget}
          variance={health.refundRateVariance}
          isInverted
        />
        <HealthMetric
          label="Tỷ lệ thu tiền"
          value={health.collectionRate}
          target={health.collectionRateTarget}
          variance={health.collectionRateVariance}
        />
      </CardContent>
    </Card>
  );
}
