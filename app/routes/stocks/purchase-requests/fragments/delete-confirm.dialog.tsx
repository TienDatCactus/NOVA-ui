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
import { useDeletePurchaseRequest } from "../container/query.hooks";
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseRequest: PurchaseRequestListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  purchaseRequest,
}: DeleteConfirmDialogProps) {
  const { mutate: deletePurchaseRequest, isPending: isDeleting } =
    useDeletePurchaseRequest();

  const handleDelete = () => {
    deletePurchaseRequest(purchaseRequest.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa yêu cầu mua hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa yêu cầu mua hàng{" "}
            <strong>{purchaseRequest.requestNumber}</strong>?
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
            {isDeleting ? "Đang xóa..." : "Xóa yêu cầu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
