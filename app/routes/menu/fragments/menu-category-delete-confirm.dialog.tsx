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
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  category: MenuCategoryItem;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  category,
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    const event = new CustomEvent("menu-category:delete", { detail: category });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa danh mục thực đơn</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <span className="font-semibold text-foreground">{category.name}</span>?
            Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả món ăn
            thuộc danh mục này.
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
