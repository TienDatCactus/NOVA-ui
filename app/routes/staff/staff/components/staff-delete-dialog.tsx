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
import type { StaffListItem } from "~/services/api/staff/dto";
import { StaffService } from "~/services/api/staff";
import { toast } from "sonner";

interface StaffDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffListItem | null;
  onSuccess: () => void;
}

export default function StaffDeleteDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!staff) return;

    setIsDeleting(true);
    try {
      await StaffService.deleteStaff(staff.id);
      toast.success(`Đã xóa nhân sự ${staff.fullName}`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Delete staff error:", error);
      // Error toast handled by http interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nhân sú</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nhân sự{" "}
            <span className="font-semibold">{staff?.fullName}</span> (
            {staff?.code})? Hành động này không thể hoàn tác.
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
