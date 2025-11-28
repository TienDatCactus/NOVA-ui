import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";

interface DashboardFiltersProps {
  filters: FinancialReportsListParams;
  onFiltersChange: (filters: FinancialReportsListParams) => void;
  onRefresh?: () => void;
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  onRefresh,
}: DashboardFiltersProps) {
  const handlePeriodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      PeriodType: value as FinancialReportsListParams["PeriodType"],
    });
  };

  const handleComparisonChange = (value: string) => {
    onFiltersChange({
      ...filters,
      ComparisonType: value as FinancialReportsListParams["ComparisonType"],
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-6 bg-card border-b">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="period-select">Khoảng thời gian</Label>
        <Select
          value={filters.PeriodType || "Today"}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger id="period-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Today">Hôm nay</SelectItem>
            <SelectItem value="ThisWeek">Tuần này</SelectItem>
            <SelectItem value="ThisMonth">Tháng này</SelectItem>
            <SelectItem value="ThisQuarter">Quý này</SelectItem>
            <SelectItem value="ThisYear">Năm này</SelectItem>
            <SelectItem value="CustomRange">Tùy chỉnh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="comparison-select">So sánh với</Label>
        <Select
          value={filters.ComparisonType || "PreviousPeriod"}
          onValueChange={handleComparisonChange}
        >
          <SelectTrigger id="comparison-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">Không so sánh</SelectItem>
            <SelectItem value="PreviousPeriod">Kỳ trước</SelectItem>
            <SelectItem value="SamePeriodLastYear">
              Cùng kỳ năm trước
            </SelectItem>
            <SelectItem value="Budget">So với ngân sách</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onRefresh && (
        <Button onClick={onRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
