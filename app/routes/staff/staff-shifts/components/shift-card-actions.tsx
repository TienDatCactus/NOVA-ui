import { CheckCircle2, Trash2, UserCog, UserX } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";

interface ShiftCardActionsProps {
  attendance: StaffAttendanceListItem | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  onDelete: () => void;
  onTransfer: () => void;
}

export function ShiftCardActions({
  attendance,
  onMarkPresent,
  onMarkAbsent,
  onDelete,
  onTransfer,
}: ShiftCardActionsProps) {
  const status = attendance?.status?.toLowerCase();

  return (
    <div className="flex gap-1">
      {/* Transfer Button - Always show */}
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onTransfer();
              }}
            >
              <UserCog className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Chuyển ca</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Mark Present Button - Show for assigned and absent */}
      {(!attendance ||
        status === "assigned" ||
        status === "unplannedabsence" ||
        status === "plannedabsence") && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkPresent();
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                {status === "absent"
                  ? "Chuyển sang đã chấm công"
                  : "Đánh dấu điểm danh"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Mark Absent Button - Show for assigned and present */}
      {(!attendance || status === "assigned" || status === "present") && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAbsent();
                }}
              >
                <UserX className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                {status === "present"
                  ? "Chuyển sang vắng mặt"
                  : "Đánh dấu vắng mặt"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Delete Button - Always show */}
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Xóa lịch</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
