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
import { useState } from "react";

interface AttendanceFilterSidebarProps {
  selectedStaffIds: string[];
  onStaffChange: (staffIds: string[]) => void;
  selectedStatus: string[];
  onStatusChange: (status: string[]) => void;
  staffList?: Array<{ staffId: string; fullName: string; staffCode: string }>;
}

const STATUS_OPTIONS = [
  { value: "present", label: "Đã chấm công" },
  { value: "absent", label: "Vắng mặt" },
  { value: "assigned", label: "Chưa chấm công" },
];

export default function AttendanceFilterSidebar({
  selectedStaffIds,
  onStaffChange,
  selectedStatus,
  onStatusChange,
  staffList = [],
}: AttendanceFilterSidebarProps) {
  const [searchText, setSearchText] = useState("");

  const activeFiltersCount =
    (searchText ? 1 : 0) +
    (selectedStaffIds.length > 0 ? 1 : 0) +
    (selectedStatus.length > 0 ? 1 : 0);

  const handleStaffToggle = (staffId: string) => {
    const newSelection = selectedStaffIds.includes(staffId)
      ? selectedStaffIds.filter((id) => id !== staffId)
      : [...selectedStaffIds, staffId];
    onStaffChange(newSelection);
  };

  const handleStatusToggle = (status: string) => {
    const newSelection = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status];
    onStatusChange(newSelection);
  };

  const handleResetFilter = () => {
    setSearchText("");
    onStaffChange([]);
    onStatusChange([]);
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.staffCode.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilter}
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
              placeholder="Tên nhân viên, mã NV..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                {filteredStaff.length} nhân viên
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 max-h-64 overflow-y-auto">
              {filteredStaff.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy nhân viên
                </p>
              ) : (
                filteredStaff.map((staff) => (
                  <div key={staff.staffId} className="flex items-center gap-2">
                    <Checkbox
                      id={`staff-${staff.staffId}`}
                      checked={selectedStaffIds.includes(staff.staffId)}
                      onCheckedChange={() => handleStaffToggle(staff.staffId)}
                    />
                    <Label
                      htmlFor={`staff-${staff.staffId}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex flex-col">
                        <span>{staff.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {staff.staffCode}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <Separator />

        {/* Status Filter */}
        <CardContent className="px-0 rounded-md mt-4">
          <Collapsible className="space-y-3" defaultOpen>
            <div className="flex items-center justify-between w-full mb-2">
              <Label className="text-sm font-semibold">Trạng thái</Label>
            </div>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                {STATUS_OPTIONS.length} trạng thái
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={selectedStatus.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                  />
                  <Label
                    htmlFor={`status-${status.value}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </aside>
  );
}
