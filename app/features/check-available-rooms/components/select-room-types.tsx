import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useRoomTypes } from "~/routes/rooms/container/room-types/query.hooks";
import { ROOM_TYPE } from "~/services/types/room.types";

function SelectRoomType({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { data: roomTypes } = useRoomTypes();
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">Loại phòng</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card shadow-md">
          <SelectValue placeholder="Chọn loại phòng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại phòng</SelectItem>
          {!!roomTypes &&
            roomTypes.length > 0 &&
            roomTypes?.map((rt) => (
              <SelectItem key={rt.id} value={rt.code}>
                {rt.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectRoomType;
