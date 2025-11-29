import { CalendarRange, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";

interface DashboardFiltersProps {
  filters: FinancialReportsListParams;
  onFiltersChange: (filters: FinancialReportsListParams) => void;
  onRefresh?: () => void;
  className?: string;
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  onRefresh,
  className,
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
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background/50 border-b backdrop-blur-sm sticky top-0 z-10",
        className
      )}
    >
      {/* Left: Filter Group */}
      <div className="flex flex-1 flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Visual Icon */}
        <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md bg-muted text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
        </div>

        {/* Period Filter */}
        <div className="flex-1 sm:flex-none ">
          <Select
            value={filters.PeriodType || "Today"}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="h-9 bg-white shadow-sm border-gray-200">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="truncate">
                  <SelectValue placeholder="Chọn thời gian" />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Hôm nay</SelectItem>
              <SelectItem value="ThisWeek">Tuần này</SelectItem>
              <SelectItem value="ThisMonth">Tháng này</SelectItem>
              <SelectItem value="ThisQuarter">Quý này</SelectItem>
              <SelectItem value="ThisYear">Năm này</SelectItem>
              <SelectItem value="CustomRange">Tùy chỉnh...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comparison Filter */}
        <div className="flex-1 sm:flex-none min-w-[180px]">
          <Select
            value={filters.ComparisonType || "PreviousPeriod"}
            onValueChange={handleComparisonChange}
          >
            <SelectTrigger className="h-9 bg-white shadow-sm border-gray-200">
              <span className="text-muted-foreground text-xs mr-1 font-normal">
                So sánh:
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">Không so sánh</SelectItem>
              <SelectItem value="PreviousPeriod">Kỳ trước</SelectItem>
              <SelectItem value="SamePeriodLastYear">
                Cùng kỳ năm ngoái
              </SelectItem>
              <SelectItem value="Budget">Ngân sách</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Actions */}
      {onRefresh && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                className="h-9 w-9 shrink-0 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Làm mới dữ liệu</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
