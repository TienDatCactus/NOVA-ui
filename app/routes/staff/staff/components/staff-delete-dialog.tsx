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
import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import { useDeleteStaff } from "../container/query.hooks";

interface StaffDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffListItemDto | null;
}

export default function StaffDeleteDialog({
  open,
  onOpenChange,
  staff,
}: StaffDeleteDialogProps) {
  const { mutateAsync: deleteStaff, isPending: isDeleting } = useDeleteStaff();
  const handleConfirm = async () => {
    if (!staff) return;
    try {
      await deleteStaff(staff.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Delete staff error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa nhân sự</AlertDialogTitle>
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
