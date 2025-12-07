import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  ArrowRightLeft,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";
import { cn } from "~/lib/utils";

interface DashboardToolbarProps {
  filters: FinancialReportsListParams;
  onFiltersChange: (filters: FinancialReportsListParams) => void;
  onRefresh: () => void;
  generatedAt?: string;
  isRefreshing?: boolean;
}

export function DashboardToolbar({
  filters,
  onFiltersChange,
  onRefresh,
  generatedAt,
  isRefreshing,
}: DashboardToolbarProps) {
  const [isCustomDate, setIsCustomDate] = useState(
    filters.PeriodType === "CustomRange"
  );

  useEffect(() => {
    setIsCustomDate(filters.PeriodType === "CustomRange");
  }, [filters.PeriodType]);

  const handlePeriodChange = (value: string) => {
    const isCustom = value === "CustomRange";
    setIsCustomDate(isCustom);

    const newFilters = {
      ...filters,
      PeriodType: value as any,
    };

    if (!isCustom) {
      newFilters.StartDate = undefined;
      newFilters.EndDate = undefined;
    }

    onFiltersChange(newFilters);
  };

  const handleCustomRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range?.from) {
      onFiltersChange({
        ...filters,
        PeriodType: "CustomRange", // Ensure type is set
        StartDate: format(range.from, "yyyy-MM-dd"),
        EndDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
      });
    }
  };

  return (
    <header className="bg-background/80 border-b shadow-sm h-16">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Báo cáo tài chính
            </h1>
            {generatedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Cập nhật lúc:
                <span className="font-medium font-mono text-foreground/80">
                  {format(new Date(generatedAt), "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Toolbar Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
            {/* Filter Group: Time */}
            <div className="flex items-center gap-2 w-full sm:w-auto p-1 bg-muted/30 rounded-lg border">
              <Select
                value={filters.PeriodType || "Today"}
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none focus:ring-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-foreground font-medium truncate">
                      <SelectValue placeholder="Chọn kỳ" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Today">Hôm nay</SelectItem>
                  <SelectItem value="ThisWeek">Tuần này</SelectItem>
                  <SelectItem value="ThisMonth">Tháng này</SelectItem>
                  <SelectItem value="ThisQuarter">Quý này</SelectItem>
                  <SelectItem value="ThisYear">Năm nay</SelectItem>
                  <Separator className="my-1" />
                  <SelectItem value="CustomRange">Tùy chỉnh...</SelectItem>
                </SelectContent>
              </Select>

              {isCustomDate && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <DateRangePicker
                    from={
                      filters.StartDate
                        ? new Date(filters.StartDate)
                        : undefined
                    }
                    to={filters.EndDate ? new Date(filters.EndDate) : undefined}
                    onRangeChange={handleCustomRangeChange}
                    className="w-auto border-none bg-transparent shadow-none h-9 px-2"
                    placeholder="Chọn ngày"
                  />
                </>
              )}
            </div>

            {/* Filter Group: Comparison */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={filters.ComparisonType || "PreviousPeriod"}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, ComparisonType: value as any })
                }
              >
                <SelectTrigger className="w-full sm:w-[160px] h-10">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="So sánh" />
                  </div>
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

            <Separator orientation="vertical" className="h-8 hidden xl:block" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-10 px-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
