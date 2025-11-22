import { Button } from "~/components/ui/button";
import { Plus, Download, Loader2, RefreshCw, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { PayrollFilterState } from "../container/filter.hooks";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import { toast } from "sonner";
import { useState } from "react";
import GeneratePayrollDialog from "../components/generate-payroll-dialog";
import { useRefreshPayrollDays } from "../container/query.hooks";

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
  resetFilter,
}: HeaderLayoutProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [isExporting, setIsExporting] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  const { mutate: refreshDays, isPending: isRefreshing } =
    useRefreshPayrollDays();
  const handleExportMonthly = async () => {
    if (!filterState.year) {
      toast.error("Vui lòng chọn năm để xuất báo cáo");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await StaffPayrollService.exportMonthly({
        year: filterState.year,
        month: filterState.month || currentDate.getMonth() + 1,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BangLuong_${filterState.month || "TatCa"}_${filterState.year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất báo cáo bảng lương thành công");
    } catch (error) {
      toast.error("Không thể xuất báo cáo");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshDays = () => {
    if (!filterState.year) {
      toast.error("Vui lòng chọn năm để làm mới dữ liệu");
      return;
    }

    refreshDays(
      {
        year: filterState.year,
        month: filterState.month || currentDate.getMonth() + 1,
      },
      {
        onSuccess: () => {
          toast.success("Làm mới dữ liệu bảng lương thành công");
          onRefresh?.();
        },
        onError: (error) => {
          toast.error("Không thể làm mới dữ liệu");
          console.error("Refresh error:", error);
        },
      }
    );
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bảng lương</h1>
          <p className="text-muted-foreground">
            Quản lý bảng lương của nhân viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshDays}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Làm mới
          </Button>

          <Button
            variant="success"
            onClick={handleExportMonthly}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Xuất bảng lương
          </Button>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo bảng lương
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên nhân viên..."
            value={filterState.search || ""}
            onChange={(e) => updateFilter({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select
          value={filterState.month?.toString() || "all"}
          onValueChange={(value) =>
            updateFilter({
              month: value === "all" ? undefined : parseInt(value),
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={m.toString()}>
                Tháng {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterState.year?.toString() || currentYear.toString()}
          onValueChange={(value) => updateFilter({ year: parseInt(value) })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
              (y) => (
                <SelectItem key={y} value={y.toString()}>
                  Năm {y}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      <GeneratePayrollDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
}
