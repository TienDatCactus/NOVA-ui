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
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { useDeleteStockItem } from "../container/query.hooks";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  item: StockItemsListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  item,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteStockItem();

  const handleDelete = () => {
    deleteItem(item.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa hàng hóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa món hàng <strong>{item.name}</strong>?
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
            {isDeleting ? "Đang xóa..." : "Xóa sản phẩm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
