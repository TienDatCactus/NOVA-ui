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
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { useDeleteMenuItem } from "../../container/menu/mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  menuItem,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteMenuItem, isPending } = useDeleteMenuItem(
    menuItem.itemId
  );

  const handleConfirm = () => {
    deleteMenuItem();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Xác nhận xóa món ăn</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Bạn có chắc chắn muốn xóa món ăn{" "}
              <span className="font-semibold text-foreground">
                {menuItem.name}
              </span>{" "}
              không?
            </p>
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
