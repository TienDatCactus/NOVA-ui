import { useState } from "react";
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
import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";
import { WorkShiftService } from "~/services/api/staff/work-shift";
import { toast } from "sonner";

interface DeleteWorkShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workShift: WorkShiftListItem | null;
  onSuccess: () => void;
}

export default function DeleteWorkShiftDialog({
  open,
  onOpenChange,
  workShift,
  onSuccess,
}: DeleteWorkShiftDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!workShift) return;

    setIsDeleting(true);
    try {
      await WorkShiftService.deleteWorkShift(workShift.id);
      toast.success(`Đã xóa ca làm việc ${workShift.name}`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Delete work shift error:", error);
      // Error toast handled by http interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa ca làm việc</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa ca làm việc{" "}
            <span className="font-semibold">{workShift?.name}</span> (
            {workShift?.code})? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
