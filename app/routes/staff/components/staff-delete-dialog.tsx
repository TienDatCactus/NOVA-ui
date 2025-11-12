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

interface StaffDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffListItem | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function StaffDeleteDialog({
  open,
  onOpenChange,
  staff,
  onConfirm,
  isDeleting,
}: StaffDeleteDialogProps) {
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
            onClick={onConfirm}
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
