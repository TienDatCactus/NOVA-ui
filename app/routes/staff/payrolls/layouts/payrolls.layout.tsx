import { CalendarDays, Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { AuthLoader, hasRole, UserRole } from "~/lib/auth/auth.loader";
import type { PayrollFilterState } from "../container/filter.hooks";
import {
  useExportMonthlyPayroll,
  useRefreshPayrollDays,
} from "../container/query.hooks";

interface HeaderLayoutProps {
  filterState: PayrollFilterState;
  updateFilter: (updates: Partial<PayrollFilterState>) => void;
  onRefresh?: () => void;
  resetFilter: () => void;
}

export default function PayrollsLayout({
  filterState,
  updateFilter,
  onRefresh,
}: HeaderLayoutProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const { mutate: refreshDays, isPending: isRefreshing } =
    useRefreshPayrollDays();
  const { mutateAsync: exportMonthly, isPending: isExporting } =
    useExportMonthlyPayroll(
      filterState.year || currentYear,
      filterState.month || 0
    );
  const handleExportMonthly = async () => {
    if (!filterState.year) {
      toast.error("Vui lòng chọn năm để xuất báo cáo");
      return;
    }

    try {
      const blob = await exportMonthly();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BangLuong_T${filterState.month || "All"}_${filterState.year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất báo cáo thành công");
    } catch (error) {}
  };

  const handleRefreshDays = () => {
    if (!filterState.year) {
      toast.error("Vui lòng chọn năm");
      return;
    }

    refreshDays(
      {
        year: filterState.year,
        month: filterState.month || currentDate.getMonth() + 1,
      },
      {
        onSuccess: () => {
          toast.success("Đã làm mới dữ liệu lương");
          onRefresh?.();
        },
        onError: () => toast.error("Lỗi khi làm mới dữ liệu"),
      }
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* === HEADER SECTION === */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Bảng lương
        </h1>
        <p className="text-muted-foreground text-sm">
          Theo dõi chi tiết thu nhập, khấu trừ và thực lĩnh của nhân viên theo
          từng kỳ.
        </p>
      </div>

      {/* === TOOLBAR SECTION === */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2 rounded-xl border bg-muted/10 shadow-sm">
        {/* Left: Time Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto p-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Kỳ lương:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={filterState.month?.toString() || "all"}
              onValueChange={(value) =>
                updateFilter({
                  month: value === "all" ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-[110px] h-9 bg-background">
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    Tháng {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground">/</span>

            <Select
              value={filterState.year?.toString() || currentYear.toString()}
              onValueChange={(value) => updateFilter({ year: parseInt(value) })}
            >
              <SelectTrigger className="w-full sm:w-[100px] h-9 bg-background">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                  (y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end p-2 pt-0 md:pt-2 md:pl-0">
          {hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshDays}
              disabled={isRefreshing}
              className="h-9 text-muted-foreground hover:text-foreground"
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Đồng bộ
            </Button>
          )}

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          {hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
            <Button
              onClick={handleExportMonthly}
              disabled={isExporting}
              size="sm"
              variant={"success"}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Xuất Excel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
