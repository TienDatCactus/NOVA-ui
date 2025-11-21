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
import { StaffRoleService } from "~/services/api/staff/staff-role";
import { toast } from "sonner";
import { useState } from "react";

interface StaffRoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: StaffRoleItem;
  onSuccess?: () => void;
}

export default function StaffRoleDeleteDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: StaffRoleDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await StaffRoleService.deleteStaffRole(role.id);
      toast.success(`Đã xóa vai trò ${role.name}`);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Delete staff role error:", error);
      toast.error("Không thể xóa vai trò. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa vai trò{" "}
            <span className="font-semibold text-foreground">{role.name}</span>?
            <br />
            <br />
            Hành động này không thể hoàn tác và có thể ảnh hưởng đến các nhân sự
            đang sử dụng vai trò này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
