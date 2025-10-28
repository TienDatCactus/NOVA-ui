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
import { useUpdateRoomStatus } from "../../container/useRoomMutation";
import { RoomStatusEnum } from "~/services/types/room.types";
interface RoomStatusCellProps {
  room: RoomListItemDto;
}

function RoomStatusCell({ room }: RoomStatusCellProps) {
  const { mutate, isPending } = useUpdateRoomStatus();
  const handleStatusChange = (newStatus: string) => {
    mutate({ roomId: room.roomId, status: newStatus });
  };
  return (
    <Select
      disabled={isPending}
      value={room.status}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-full border-primary bg-primary/10 text-primary shadow-none focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:ring-sky-400/40 [&_svg]:!text-primary dark:[&_svg]:!text-sky-400">
        <SelectValue placeholder="Thay đổi trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="[&_div:focus]:bg-primary/20 [&_div:focus]:text-primary dark:[&_div:focus]:bg-sky-400/20 dark:[&_div:focus]:text-sky-400">
          <SelectLabel>Trạng thái phòng</SelectLabel>
          {Object.entries(RoomStatusEnum).map(([key, value]) => (
            <SelectItem
              key={key}
              value={key}
              className="focus:[&_svg]:!text-primary dark:focus:[&_svg]:!text-sky-400"
            >
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default RoomStatusCell;
