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
  const [deleteScope, setDeleteScope] = useState<DeleteScope>(DeleteScope.Single);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  // Calculate end date if series exists
  const endDate = format(
    new Date(workDate.getTime() + 18 * 24 * 60 * 60 * 1000),
    "dd/MM/yyyy"
  );

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
    } finally {
      setIsDeleting(false);
    }
  };

  // Định nghĩa các options với description
  const deleteScopeOptions = [
    {
      value: DeleteScope.Single,
      id: "single",
      label: `Chỉ ngày ${formattedDate}`,
      description: "Xóa chỉ lịch làm việc này",
    },
    {
      value: DeleteScope.FromThisDateForward,
      id: "forward",
      label: `Từ ngày ${formattedDate} đến ngày ${endDate}`,
      description: "Xóa lịch làm việc từ ngày này trở đi với cùng nhân viên và ca làm",
    },
    {
      value: DeleteScope.AllInSeries,
      id: "all",
      label: "Tất cả các ngày",
      description: "Xóa tất cả lịch làm việc trong cùng chuỗi lặp lại",
    },
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lịch làm việc</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              {/* Info text */}
              <p className="text-sm">
                Bạn có chắc chắn muốn xóa lịch làm việc của{" "}
                <span className="font-semibold text-foreground">{shift.staffName}</span>{" "}
                trong ca{" "}
                <span className="font-semibold text-foreground">{shift.shiftName}</span>?
              </p>

              {/* Delete Scope Radio Group - Description bên ngoài */}
              <RadioGroup
                value={deleteScope}
                onValueChange={(value) => setDeleteScope(value as DeleteScope)}
                className="space-y-2"
              >
                {deleteScopeOptions.map((option) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                    {/* Description chỉ hiện khi selected */}
                    {deleteScope === option.value && (
                      <p className="text-xs text-muted-foreground ml-6 animate-in fade-in slide-in-from-top-1 duration-200">
                        {option.description}
                      </p>
                    )}
                  </div>
                ))}
              </RadioGroup>

              {/* Warning Note */}
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <span className="text-xs font-semibold text-destructive mt-0.5">
                  Lưu ý:
                </span>
                <p className="text-xs text-destructive">
                  Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi xóa.
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
