import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useUpdateRoomStatus } from "../../container/rooms/mutation.hooks";
import { cn } from "~/lib/utils";

interface RoomStatusCellProps {
  room: RoomListItemDto;
}

const statusColors = {
  Ready: {
    trigger: "border-green-600 bg-green-500/10 text-green-600",
    focus: "focus-visible:border-green-600 focus-visible:ring-green-600/20",
    svg: "[&_svg]:!text-green-600",
  },
  Dirty: {
    trigger: "border-orange-600 bg-orange-500/10 text-orange-600",
    focus: "focus-visible:border-orange-600 focus-visible:ring-orange-600/20",
    svg: "[&_svg]:!text-orange-600",
  },
  Cleaning: {
    trigger: "border-blue-600 bg-blue-500/10 text-blue-600",
    focus: "focus-visible:border-blue-600 focus-visible:ring-blue-600/20",
    svg: "[&_svg]:!text-blue-600",
  },
  Maintenance: {
    trigger: "border-amber-600 bg-amber-500/10 text-amber-600",
    focus: "focus-visible:border-amber-600 focus-visible:ring-amber-600/20",
    svg: "[&_svg]:!text-amber-600",
  },
  OutOfService: {
    trigger: "border-red-600 bg-red-500/10 text-red-600",
    focus: "focus-visible:border-red-600 focus-visible:ring-red-600/20",
    svg: "[&_svg]:!text-red-600",
  },
  Locked: {
    trigger: "border-gray-600 bg-gray-500/10 text-gray-600",
    focus: "focus-visible:border-gray-600 focus-visible:ring-gray-600/20",
    svg: "[&_svg]:!text-gray-600",
  },
};

function RoomStatusCell({ room }: RoomStatusCellProps) {
  const { mutate, isPending } = useUpdateRoomStatus();
  const handleStatusChange = (newStatus: string) => {
    mutate({ roomId: room.roomId, status: newStatus });
  };

  const currentStatusColor =
    statusColors[room.status as keyof typeof statusColors] ||
    statusColors.Ready;

  return (
    <Select
      disabled={isPending}
      value={room.status}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger
        className={cn(
          "w-full shadow-none",
          currentStatusColor.trigger,
          currentStatusColor.focus,
          currentStatusColor.svg
        )}
      >
        <SelectValue placeholder="Thay đổi trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Trạng thái phòng</SelectLabel>
          {Object.entries(RoomStatusEnum).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default RoomStatusCell;
