import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";
import type { StaffShiftListItem } from "~/services/api/staff/staff-shift/dto";
import type { WorkShiftListResponseDto } from "~/services/api/work-shift/dto";
import { getStatusBadge } from "../utils/status-badge";
import { ShiftCardActions } from "./shift-card-actions";

interface ShiftCardProps {
  shift: StaffShiftListItem;
  attendance: StaffAttendanceListItem | null;
  viewMode: "shift" | "staff";
  workShifts?: WorkShiftListResponseDto;
  onEdit: (shift: StaffShiftListItem) => void;
  onDelete: (shiftId: string) => void;
  onMarkPresent: (attendance: StaffAttendanceListItem | null) => void;
  onMarkAbsent: (attendance: StaffAttendanceListItem | null) => void;
}

export function ShiftCard({
  shift,
  attendance,
  viewMode,
  workShifts,
  onEdit,
  onDelete,
  onMarkPresent,
  onMarkAbsent,
}: ShiftCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusBadge = getStatusBadge(attendance?.status);
  const isAbsent = attendance?.status?.toLowerCase() === "absent";
  const hasReason = isAbsent && attendance?.absentReason;

  // Get shift time for staff view
  const shiftTime =
    viewMode === "staff" && workShifts
      ? workShifts.find((ws) => ws.id === shift.shiftId)
      : null;

  const StatusBadgeIcon = statusBadge.icon;

  const cardContent = (
    <div
      className="relative group p-2 bg-background rounded-md border hover:border-primary/50 transition-colors cursor-pointer overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(shift)}
    >
      <div className="space-y-1.5">
        {/* Primary text - staff name OR shift name */}
        <div className="text-xs font-medium truncate">
          {viewMode === "shift"
            ? shift.staffName || "N/A"
            : shift.shiftName || "N/A"}
        </div>

        {/* Secondary text - shift time (staff view only) */}
        {viewMode === "staff" && shiftTime && (
          <div className="text-[10px] text-muted-foreground">
            {shiftTime.startTime.substring(0, 5)} -{" "}
            {shiftTime.endTime.substring(0, 5)}
          </div>
        )}

        {/* Status badge with icon - always show */}
        {statusBadge.showLabel && (
          <Badge
            variant={statusBadge.variant}
            className="text-[10px] h-5 flex items-center gap-1"
          >
            <StatusBadgeIcon className="h-3 w-3" />
            <span>{statusBadge.label}</span>
          </Badge>
        )}
      </div>

      {/* Action buttons - show on hover */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-background rounded-md shadow-sm border p-0.5">
          <ShiftCardActions
            attendance={attendance}
            onMarkPresent={() => onMarkPresent(attendance)}
            onMarkAbsent={() => onMarkAbsent(attendance)}
            onDelete={() => onDelete(shift.id)}
          />
        </div>
      )}
    </div>
  );

  // Wrap with tooltip if absent and has reason
  if (hasReason) {
    return (
      <TooltipProvider key={shift.id}>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs font-semibold mb-1">Lý do vắng mặt:</p>
            <p className="text-xs">{attendance?.absentReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}
