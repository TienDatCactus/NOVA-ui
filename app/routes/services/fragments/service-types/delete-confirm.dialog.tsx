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
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useDeleteServiceType } from "../../container/service-types/mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  type: ServiceTypeItem;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  type,
}: DeleteConfirmDialogProps) {
  const { mutate } = useDeleteServiceType(type.id);
  const handleConfirm = () => {
    mutate();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa loại dịch vụ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa loại dịch vụ{" "}
            <span className="font-semibold text-foreground">{type.name}</span>?
            Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả dịch vụ
            thuộc loại này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
