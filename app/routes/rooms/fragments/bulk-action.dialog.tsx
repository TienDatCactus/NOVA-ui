import { Trash2, Edit } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  ROOM_MANAGEMENT_STATUS,
  ROOM_MANAGEMENT_STATUS_LABELS,
} from "~/lib/constants";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { useState } from "react";

interface BulkActionsToolbarProps {
  selectedRooms: RoomListItemDto[];
  onBulkDelete: (roomIds: string[]) => void;
  onBulkStatusChange: (roomIds: string[], newStatus: number) => void;
  onClearSelection: () => void;
}

function BulkActionsToolbar({
  selectedRooms,
  onBulkDelete,
  onBulkStatusChange,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  if (selectedRooms.length === 0) {
    return null;
  }

  const handleStatusChange = () => {
    if (!selectedStatus) return;

    const roomIds = selectedRooms.map((room) => room.roomId);
    onBulkStatusChange(roomIds, Number(selectedStatus));
    setSelectedStatus("");
  };

  const handleBulkDelete = () => {
    const roomIds = selectedRooms.map((room) => room.roomId);
    onBulkDelete(roomIds);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
      <div className="flex-1">
        <p className="text-sm font-medium">
          Đã chọn <span className="text-primary">{selectedRooms.length}</span>{" "}
          phòng
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Status Change */}
        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Đổi trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROOM_MANAGEMENT_STATUS).map(([key, value]) => (
                <SelectItem key={value} value={value.toString()}>
                  {ROOM_MANAGEMENT_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleStatusChange}
            disabled={!selectedStatus}
            size="sm"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Cập nhật
          </Button>
        </div>

        {/* Bulk Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Xóa ({selectedRooms.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa {selectedRooms.length} phòng đã chọn?
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear Selection */}
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}

export default BulkActionsToolbar;
