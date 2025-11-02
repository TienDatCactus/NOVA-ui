import { AlertTriangle } from "lucide-react";
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
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import { useDeleteMenuCategory } from "../../container/menu-categories/mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: MenuCategoryItemDto;
}

/**
 * Dialog xác nhận xóa menu category
 */
export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  category,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteCategory, isPending } = useDeleteMenuCategory();

  const handleConfirm = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <span className="font-semibold text-foreground">
                {category.name}
              </span>{" "}
              ({category.code}) không?
            </p>
            {category.menuItemCount > 0 && (
              <p className="text-amber-600 font-medium">
                ⚠️ Danh mục này có {category.menuItemCount} món ăn!
              </p>
            )}
            <p className="text-destructive font-medium">
              Hành động này không thể hoàn tác!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
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
