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
import { useDeleteRoom } from "../../container/rooms/mutation.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  room: RoomListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  room,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();

  const handleDelete = () => {
    deleteRoom(room.roomId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phòng <strong>{room.roomName}</strong>?
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
            {isDeleting ? "Đang xóa..." : "Xóa phòng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
