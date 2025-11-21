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
import { useDeleteStockAdjustment } from "../container/query.hooks";
import type { StockAdjustmentListItemDto } from "~/services/api/stocks/stock-adjustments/dto";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  adjustment: StockAdjustmentListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  adjustment,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteAdjustment, isPending: isDeleting } =
    useDeleteStockAdjustment();

  const handleDelete = () => {
    deleteAdjustment(adjustment.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa phiếu điều chỉnh</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phiếu{" "}
            <strong className="font-mono">{adjustment.reference}</strong>?
            <br />
            <span className="text-destructive font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
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
