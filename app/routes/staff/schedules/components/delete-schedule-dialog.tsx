import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import type { StaffShiftListItem } from "~/services/api/staff-shift/dto";
import { DeleteScope } from "~/services/api/staff-shift/staff-shift.type";
import { StaffShiftService } from "~/services/api/staff-shift";

interface DeleteScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: StaffShiftListItem | null;
  onSuccess: () => void;
}

export default function DeleteScheduleDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: DeleteScheduleDialogProps) {
  const [deleteScope, setDeleteScope] = useState<DeleteScope>(
    DeleteScope.Single
  );
  const [isDeleting, setIsDeleting] = useState(false);

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  // Calculate end date if series exists (mock - would come from API/groupId data)
  const endDate = format(
    new Date(workDate.getTime() + 18 * 24 * 60 * 60 * 1000),
    "dd/MM/yyyy"
  ); // Mock: +18 days

  const handleDelete = async () => {
    if (!shift.id) {
      toast.error("Không thể xóa lịch làm việc này");
      return;
    }

    setIsDeleting(true);
    try {
      await StaffShiftService.deleteStaffShift(shift.id, deleteScope);
      toast.success("Xóa lịch làm việc thành công");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete shift schedule:", error);
      // Error toast already handled by http interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lịch làm việc</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa lịch làm việc của{" "}
                <span className="font-semibold text-foreground">
                  {shift.staffName}
                </span>{" "}
                trong ca{" "}
                <span className="font-semibold text-foreground">
                  {shift.shiftName}
                </span>
                ?
              </p>

              {/* Delete Scope Options */}
              <RadioGroup
                value={deleteScope}
                onValueChange={(value) => setDeleteScope(value as DeleteScope)}
                className="space-y-3"
              >
                {/* Single Day */}
                <div className="flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={DeleteScope.Single} id="single" />
                  <Label
                    htmlFor="single"
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div className="font-medium">Chỉ ngày {formattedDate}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Xóa chỉ lịch làm việc này
                    </div>
                  </Label>
                </div>

                {/* From This Date Forward */}
                <div className="flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value={DeleteScope.FromThisDateForward}
                    id="forward"
                  />
                  <Label
                    htmlFor="forward"
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div className="font-medium">
                      Từ ngày {formattedDate} đến ngày {endDate}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Xóa lịch làm việc từ ngày này trở đi với cùng nhân viên và
                      ca làm
                    </div>
                  </Label>
                </div>

                {/* All In Series */}
                <div className="flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value={DeleteScope.AllInSeries}
                    id="all"
                  />
                  <Label
                    htmlFor="all"
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div className="font-medium">Tất cả các ngày</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Xóa tất cả lịch làm việc trong cùng chuỗi lặp lại
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Warning Note */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-xs text-destructive">
                  <span className="font-semibold">Lưu ý:</span> Hành động này
                  không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi xóa.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Bỏ qua</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Đồng ý"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
