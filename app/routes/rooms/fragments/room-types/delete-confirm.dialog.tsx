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
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { useDeleteRoom } from "../../container/rooms/mutation.hooks";
import { useDeleteRoomType } from "../../container/room-types/mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  roomType: RoomTypesListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  roomType,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoomType(
    roomType.id
  );

  const handleDelete = () => {
    deleteRoom(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa loại phòng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa loại phòng{" "}
            <strong>{roomType.name}</strong>?
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
            {isDeleting ? "Đang xóa..." : "Xóa loại phòng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
