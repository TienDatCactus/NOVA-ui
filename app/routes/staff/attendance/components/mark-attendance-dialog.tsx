import { useState } from "react";
import { toast } from "sonner";
import { StaffAttendanceService } from "~/services/api/staff-attendance";
import type { StaffAttendanceListItem } from "~/services/api/staff-attendance/dto";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { format, parseISO } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

interface MarkAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: StaffAttendanceListItem | null;
  onSuccess?: () => void;
}

export default function MarkAttendanceDialog({
  open,
  onOpenChange,
  attendance,
  onSuccess,
}: MarkAttendanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkPresent = async () => {
    if (!attendance?.id) {
      toast.error("Không tìm thấy thông tin chấm công");
      return;
    }

    setIsSubmitting(true);
    try {
      await StaffAttendanceService.markPresent(attendance.id);
      toast.success("Đánh dấu điểm danh thành công");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!attendance) return null;

  const workDate = attendance.workDate ? parseISO(attendance.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");
  const isAlreadyPresent = attendance.status.toLowerCase() === "present";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh dấu điểm danh</DialogTitle>
          <DialogDescription>
            Xác nhận điểm danh cho nhân viên trong ca làm việc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Attendance Info Card */}
          <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Thông tin ca làm việc</span>
            </div>
            
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[100px]">Nhân viên:</span>
                <span className="font-medium">{attendance.staffName}</span>
                <span className="text-xs text-muted-foreground">({attendance.staffCode})</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[100px]">Ca làm việc:</span>
                <span className="font-medium">{attendance.shiftName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[100px]">Thời gian:</span>
                <span className="font-medium">{attendance.startTime.substring(0, 5)} - {attendance.endTime.substring(0, 5)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[100px]">Ngày làm việc:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {isAlreadyPresent ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Đã điểm danh
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Nhân viên này đã được đánh dấu có mặt
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Chưa điểm danh
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Nhấn xác nhận để đánh dấu nhân viên có mặt
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {isAlreadyPresent ? "Đóng" : "Hủy"}
          </Button>
          
          {!isAlreadyPresent && (
            <Button 
              onClick={handleMarkPresent} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận điểm danh"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
