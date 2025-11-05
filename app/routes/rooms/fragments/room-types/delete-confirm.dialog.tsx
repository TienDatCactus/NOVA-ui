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
import { AlertTriangle } from "lucide-react";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { useDeleteRoomType } from "../../container/room-types/delete.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  roomType: RoomTypesListItemDto;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  roomType,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteRoomType, isPending } = useDeleteRoomType();

  const handleConfirmDelete = () => {
    deleteRoomType(roomType.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Xóa hạng phòng</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            Bạn có chắc chắn muốn xóa hạng phòng{" "}
            <span className="font-semibold text-foreground">
              {roomType.name}
            </span>{" "}
            (
            <span className="font-mono text-xs text-foreground">
              {roomType.code}
            </span>
            )?
            <br />
            <br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Đang xóa..." : "Xóa hạng phòng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
