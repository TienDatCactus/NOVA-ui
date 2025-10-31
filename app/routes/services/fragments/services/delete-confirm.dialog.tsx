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
import type { ServiceItem } from "~/services/api/services/dto";
import { useDeleteService } from "../../container/service-mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  service: ServiceItem;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  service,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteService } = useDeleteService();
  const handleConfirm = () => {
    deleteService(service.serviceItemId);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa dịch vụ{" "}
            <span className="font-semibold text-foreground">
              {service.name}
            </span>
            ? Hành động này không thể hoàn tác.
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
