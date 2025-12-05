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
import type { StaffRoleItem } from "~/services/api/staff/staff-role/dto";
import { useDeleteStaffRole } from "../container/query.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  role: StaffRoleItem;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  role,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteRole, isPending } = useDeleteStaffRole();

  const handleDelete = () => {
    deleteRole(role.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa Chức vụ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa Chức vụ <strong>{role.name}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
