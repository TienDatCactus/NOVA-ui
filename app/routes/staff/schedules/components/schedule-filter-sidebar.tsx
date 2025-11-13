import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Checkbox } from "~/components/ui/checkbox";
import type { ScheduleFilterState } from "../container/filter.hooks";
import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff";
import { WorkShiftService } from "~/services/api/work-shift";

interface ScheduleFilterSidebarProps {
  filterState: ScheduleFilterState;
  updateFilter: (updates: Partial<ScheduleFilterState>) => void;
  onResetFilter: () => void;
}

export default function ScheduleFilterSidebar({
  filterState,
  updateFilter,
  onResetFilter,
}: ScheduleFilterSidebarProps) {
  const { data: staffListResponse } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => await StaffService.getStaffList(),
  });

  const { data: workShifts } = useQuery({
    queryKey: ["work-shifts"],
    queryFn: async () => await WorkShiftService.getWorkShiftList(),
  });

  const staffList = staffListResponse?.data || [];

  const activeFiltersCount =
    (filterState.searchText ? 1 : 0) +
    (filterState.selectedStaffId ? 1 : 0) +
    (filterState.selectedShiftIds.length > 0 ? 1 : 0);

  const handleStaffToggle = (staffId: string) => {
    updateFilter({
      selectedStaffId: filterState.selectedStaffId === staffId ? "" : staffId,
    });
  };

  const handleShiftToggle = (shiftId: string) => {
    const currentIds = filterState.selectedShiftIds || [];
    const newIds = currentIds.includes(shiftId)
      ? currentIds.filter((id) => id !== shiftId)
      : [...currentIds, shiftId];
    updateFilter({ selectedShiftIds: newIds });
  };

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilter}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Card className="p-3 shadow-sm">
        <CardContent className="px-0">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Tìm kiếm
            </Label>
            <Input
              id="search"
              placeholder="Tên nhân viên, ca làm..."
              value={filterState.searchText}
              onChange={(e) => updateFilter({ searchText: e.target.value })}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>

        <Separator />

        {/* Staff Filter */}
        <CardContent className="px-0 rounded-md mt-4">
          <Collapsible className="space-y-3" defaultOpen>
            <div className="flex items-center justify-between w-full mb-2">
              <Label className="text-sm font-semibold">Nhân viên</Label>
            </div>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                {staffList.length} nhân viên
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 max-h-64 overflow-y-auto">
              {staffList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có nhân viên nào
                </p>
              ) : (
                staffList.map((staff) => (
                  <div key={staff.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`staff-${staff.id}`}
                      checked={filterState.selectedStaffId === staff.id}
                      onCheckedChange={() => handleStaffToggle(staff.id)}
                    />
                    <Label
                      htmlFor={`staff-${staff.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {staff.fullName}
                    </Label>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <Separator />

        {/* Shift Filter */}
        <CardContent className="px-0 rounded-md mt-4">
          <Collapsible className="space-y-3" defaultOpen>
            <div className="flex items-center justify-between w-full mb-2">
              <Label className="text-sm font-semibold">Ca làm việc</Label>
            </div>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                {workShifts?.length || 0} ca
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {!workShifts || workShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có ca làm việc nào
                </p>
              ) : (
                workShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`shift-${shift.id}`}
                      checked={filterState.selectedShiftIds.includes(shift.id)}
                      onCheckedChange={() => handleShiftToggle(shift.id)}
                    />
                    <Label
                      htmlFor={`shift-${shift.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex flex-col">
                        <span>{shift.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </aside>
  );
}
