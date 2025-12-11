import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  X,
  LayoutGrid,
  Users,
  CalendarRange,
  Search,
  CheckIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { useStaffList } from "../../staff/container/query.hooks";
import type { StaffShiftFilters } from "../container/filter.hooks";
import {
  useExportWeeklyMatrix,
  useExportWeeklyForm2,
} from "../container/query.hooks";
import { cn } from "~/lib/utils";
import { Tabs, TabsTrigger } from "~/components/ui/tabs";
import { ButtonGroup } from "~/components/ui/button-group";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { AxiosError } from "axios";

interface SchedulesViewLayoutProps {
  filters: StaffShiftFilters;
  updateFilters: <K extends keyof StaffShiftFilters>(
    key: K,
    value: StaffShiftFilters[K]
  ) => void;
  resetFilters: () => void;
  viewMode: "shift" | "staff";
  children: ReactNode;
  onViewModeChange: (mode: "shift" | "staff") => void;
  totalShifts: number;
}

export default function SchedulesViewLayout({
  filters,
  updateFilters,
  resetFilters,
  viewMode,
  children,
  onViewModeChange,
  totalShifts = 0,
}: SchedulesViewLayoutProps) {
  const { data: staffList } = useStaffList();
  const [isExporting, setIsExporting] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [exportDate, setExportDate] = useState<{ from: Date; to: Date } | null>(
    {
      from: new Date(),
      to: new Date(),
    }
  );
  const exportWeeklyMatrix = useExportWeeklyMatrix();
  const exportWeeklyForm2 = useExportWeeklyForm2();

  const activeFiltersCount =
    (filters.selectedStaffId ? 1 : 0) +
    (filters.fromDate ? 1 : 0) +
    (filters.toDate ? 1 : 0);

  const downloadFile = (blob: Blob, filename: string) => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi xuất báo cáo");
      }
    }
  };

  const handleExportMatrix = async () => {
    if (!exportDate?.from || !exportDate?.to) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }
    setIsExporting(true);
    try {
      const blob = await exportWeeklyMatrix.mutateAsync({
        from: format(exportDate.from, "yyyy-MM-dd"),
        to: format(exportDate.to, "yyyy-MM-dd"),
      });
      downloadFile(
        blob,
        `lich-lam-viec-kiem-cu-${format(exportDate.from, "yyyy-MM-dd")}.xlsx`
      );
      toast.success("Xuất file kiểm cũ thành công");
    } catch (error) {
      toast.error("Xuất file thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportForm2 = async () => {
    if (!exportDate?.from || !exportDate?.to) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }
    setIsExporting(true);
    try {
      const blob = await exportWeeklyForm2.mutateAsync({
        from: format(exportDate.from, "yyyy-MM-dd"),
        to: format(exportDate.to, "yyyy-MM-dd"),
      });
      downloadFile(
        blob,
        `lich-lam-viec-kiem-moi-${format(exportDate.from, "yyyy-MM-dd")}.xlsx`
      );
      toast.success("Xuất file kiểm mới thành công");
    } catch (error) {
      toast.error("Xuất file thất bại");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviousWeek = () => {
    const currentFrom = filters.fromDate
      ? new Date(filters.fromDate)
      : new Date();
    const previousWeekStart = addWeeks(
      startOfWeek(currentFrom, { weekStartsOn: 1 }),
      -1
    );
    const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
    updateFilters("fromDate", format(previousWeekStart, "yyyy-MM-dd"));
    updateFilters("toDate", format(previousWeekEnd, "yyyy-MM-dd"));
  };

  const handleNextWeek = () => {
    const currentFrom = filters.fromDate
      ? new Date(filters.fromDate)
      : new Date();
    const nextWeekStart = addWeeks(
      startOfWeek(currentFrom, { weekStartsOn: 1 }),
      1
    );
    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
    updateFilters("fromDate", format(nextWeekStart, "yyyy-MM-dd"));
    updateFilters("toDate", format(nextWeekEnd, "yyyy-MM-dd"));
  };

  const handleCurrentWeek = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    updateFilters("fromDate", format(weekStart, "yyyy-MM-dd"));
    updateFilters("toDate", format(weekEnd, "yyyy-MM-dd"));
  };

  const filteredStaffList = staffList?.filter((s) =>
    s.fullName.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-muted/10 min-h-screen">
      {/* === HEADER TOOLBAR === */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 justify-between shrink-0">
        {/* Top Row: Title & Main Actions */}

        <div className="flex items-center gap-4">
          <div className="grid gap-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Lịch làm việc
            </h1>
            <p className="text-xs text-muted-foreground">
              Tổng{" "}
              <span className="font-medium text-foreground">{totalShifts}</span>{" "}
              ca tuần này
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ">
          {/* Export Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                disabled={isExporting}
                variant="success"
                size="sm"
                className="h-9 gap-2 shadow-sm"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Xuất Excel</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Chọn khoảng thời gian
                  </Label>
                  <DateRangePicker
                    from={exportDate?.from}
                    to={exportDate?.to}
                    onRangeChange={(range) =>
                      setExportDate(
                        range.from && range.to
                          ? { from: range.from, to: range.to }
                          : null
                      )
                    }
                    placeholder="Chọn thời gian xuất"
                    className="w-full"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={handleExportMatrix}
                    disabled={
                      !exportDate?.from || !exportDate?.to || isExporting
                    }
                  >
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-2" />
                    )}
                    Mẫu kiểm cũ
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-9 text-sm"
                    onClick={handleExportForm2}
                    disabled={
                      !exportDate?.from || !exportDate?.to || isExporting
                    }
                  >
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-2" />
                    )}
                    Mẫu kiểm mới
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Bottom Row: Navigation & View Control */}
      <div className="px-6 py-3 bg-background border-b flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        {/* Left: View Mode Toggle (Segmented Control style) */}
        <ButtonGroup className="bg-muted/50 p-1 rounded-lg flex items-center border">
          <Button
            onClick={() => onViewModeChange("shift")}
            variant={viewMode === "shift" ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Theo ca
          </Button>
          <Button
            onClick={() => onViewModeChange("staff")}
            variant={viewMode === "staff" ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            )}
          >
            <Users className="w-4 h-4" />
            Nhân viên
          </Button>
        </ButtonGroup>

        {/* Center: Week Navigator */}
        <div className="flex items-center bg-background border rounded-lg shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-9 w-9 rounded-none rounded-l-lg border-r hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-4 h-9 text-sm font-medium min-w-[200px] justify-center cursor-default">
            <span className="text-muted-foreground font-normal">
              Tuần{" "}
              {format(
                filters.fromDate ? new Date(filters.fromDate) : new Date(),
                "w",
                { locale: vi }
              )}
              :
            </span>
            <span>
              {format(
                filters.fromDate ? new Date(filters.fromDate) : new Date(),
                "dd/MM",
                { locale: vi }
              )}
              {" - "}
              {format(
                filters.toDate ? new Date(filters.toDate) : new Date(),
                "dd/MM",
                { locale: vi }
              )}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            className="h-9 w-9 rounded-none border-l hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCurrentWeek}
            className="h-9 rounded-none rounded-r-lg border-l px-3 hover:bg-muted text-xs font-medium uppercase text-muted-foreground hover:text-primary"
          >
            Hôm nay
          </Button>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={filters.selectedStaffId ? "secondary" : "outline"}
                size="sm"
                className="h-9 gap-2 border-dashed"
              >
                <Filter className="w-3.5 h-3.5" />
                Lọc nhân viên
                {filters.selectedStaffId && (
                  <Badge variant="default" className="ml-1 h-5 px-1.5">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="end">
              <div className="p-3 pb-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    className="w-full bg-muted/30 border rounded-md py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Tìm nhân viên..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="h-[240px]">
                <div className="p-1">
                  {filteredStaffList?.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-4">
                      Không tìm thấy
                    </p>
                  ) : (
                    filteredStaffList?.map((staff) => {
                      const isSelected = filters.selectedStaffId === staff.id;
                      return (
                        <div
                          key={staff.id}
                          onClick={() =>
                            updateFilters(
                              "selectedStaffId",
                              isSelected ? "" : staff.id
                            )
                          }
                          className={cn(
                            "flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors text-sm",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="font-medium truncate">
                            {staff.fullName}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {filters.selectedStaffId && (
                <div className="p-2 border-t bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => updateFilters("selectedStaffId", "")}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilters}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              title="Xóa tất cả bộ lọc"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
