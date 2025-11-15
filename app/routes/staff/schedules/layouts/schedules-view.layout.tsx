import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Loader2,
  Search,
  X,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { ScheduleFilterState } from "../container/filter.hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff";
import { WorkShiftService } from "~/services/api/work-shift";

interface SchedulesViewLayoutProps {
  filterState: ScheduleFilterState;
  onFilterChange: (updates: Partial<ScheduleFilterState>) => void;
  onResetFilter: () => void;
  totalShifts: number;
  onAddSchedule: () => void;
  onExportMatrix: () => void;
  onExportForm2: () => void;
  isExporting: boolean;
  currentWeekStart: Date;
  weekEnd: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  viewMode: "shift" | "staff";
  onViewModeChange: (mode: "shift" | "staff") => void;
  children: ReactNode;
}

export default function SchedulesViewLayout({
  filterState,
  onFilterChange,
  onResetFilter,
  totalShifts,
  onAddSchedule,
  onExportMatrix,
  onExportForm2,
  isExporting,
  currentWeekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
  onToday,
  viewMode,
  onViewModeChange,
  children,
}: SchedulesViewLayoutProps) {
  const { data: staffListResponse } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => await StaffService.getStaffList(),
  });

  const { data: workShifts } = useQuery({
    queryKey: ["work-shifts-active"],
    queryFn: async () => await WorkShiftService.getActiveWorkShiftList(),
  });

  const staffList = staffListResponse?.data || [];

  const activeFiltersCount =
    (filterState.searchText ? 1 : 0) +
    (filterState.selectedStaffId ? 1 : 0) +
    (filterState.selectedShiftIds.length > 0 ? 1 : 0);

  const handleStaffToggle = (staffId: string) => {
    onFilterChange({
      selectedStaffId: filterState.selectedStaffId === staffId ? "" : staffId,
    });
  };

  const handleShiftToggle = (shiftId: string) => {
    const currentIds = filterState.selectedShiftIds || [];
    const newIds = currentIds.includes(shiftId)
      ? currentIds.filter((id) => id !== shiftId)
      : [...currentIds, shiftId];
    onFilterChange({ selectedShiftIds: newIds });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="space-y-4">
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Lịch làm việc</h1>
            <Badge variant="secondary" className="text-sm">
              {totalShifts} ca làm
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Select */}
            <Select value={viewMode} onValueChange={onViewModeChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn chế độ xem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shift">Xem theo ca</SelectItem>
                <SelectItem value="staff">Xem theo nhân viên</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Export Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button disabled={isExporting} variant="outline">
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Xuất file
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2"
                    onClick={onExportMatrix}
                    disabled={isExporting}
                  >
                    Xuất file kiểm cũ 
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2"
                    onClick={onExportForm2}
                    disabled={isExporting}
                  >
                    Xuất file kiểm mới
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={onAddSchedule}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm lịch
            </Button>
          </div>
        </div>

        {/* Filter and Week Navigator Row - CHỈ SỬA PHẦN NÀY */}
        <div className="flex items-center justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            {/* Search Input - Cố định width */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên, ca làm..."
                value={filterState.searchText}
                onChange={(e) => onFilterChange({ searchText: e.target.value })}
                className="pl-9 h-9"
              />
            </div>

            {/* Staff Filter Popover */}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5">
      <Filter className="h-3.5 w-3.5" />
      Nhân viên
      {filterState.selectedStaffId && (
        <Badge variant="secondary" className="ml-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
          1
        </Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-64 p-2.5" align="start">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs">Chọn nhân viên</h4>
        {filterState.selectedStaffId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ selectedStaffId: "" })}
            className="h-6 px-1.5 text-xs"
          >
            Xóa
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-56">
        <div className="space-y-1 pr-2">
          {staffList.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Chưa có nhân viên nào
            </p>
          ) : (
            staffList.map((staff) => (
              <div key={staff.id} className="flex items-center gap-1.5 py-0.5">
                <Checkbox
                  id={`staff-${staff.id}`}
                  checked={filterState.selectedStaffId === staff.id}
                  onCheckedChange={() => handleStaffToggle(staff.id)}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`staff-${staff.id}`}
                  className="text-xs font-normal cursor-pointer flex-1"
                >
                  {staff.fullName}
                </Label>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  </PopoverContent>
</Popover>

{/* Shift Filter Popover */}
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className="h-9 gap-1 px-2.5">
      <Filter className="h-3.5 w-3.5" />
      Ca làm việc
      {filterState.selectedShiftIds.length > 0 && (
        <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
          {filterState.selectedShiftIds.length}
        </Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-64 p-2.5" align="start">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs">Chọn ca làm việc</h4>
        {filterState.selectedShiftIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ selectedShiftIds: [] })}
            className="h-6 px-1.5 text-xs"
          >
            Xóa
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-56">
        <div className="space-y-1 pr-2">
          {!workShifts || workShifts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Chưa có ca làm việc nào
            </p>
          ) : (
            workShifts.map((shift) => (
              <div key={shift.id} className="flex items-center gap-1.5 py-0.5">
                <Checkbox
                  id={`shift-${shift.id}`}
                  checked={filterState.selectedShiftIds.includes(shift.id)}
                  onCheckedChange={() => handleShiftToggle(shift.id)}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`shift-${shift.id}`}
                  className="text-xs font-normal cursor-pointer flex-1"
                >
                  <div className="flex flex-col gap-0">
                    <span>{shift.name}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {shift.startTime.substring(0, 5)} -{" "}
                      {shift.endTime.substring(0, 5)}
                    </span>
                  </div>
                </Label>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  </PopoverContent>
</Popover>


            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilter}
                className="h-9 gap-1 px-2"
              >
                <X className="h-3.5 w-3.5" />
                Xóa ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPrevWeek} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-4 whitespace-nowrap">
              Tuần {format(currentWeekStart, "w", { locale: vi })} -{" "}
              {format(currentWeekStart, "dd/MM", { locale: vi })} đến{" "}
              {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
            </div>
            <Button variant="outline" size="icon" onClick={onNextWeek} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToday} className="h-9">
              Tuần này
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {children}
    </div>
  );
}
