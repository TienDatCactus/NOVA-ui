import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ROOM_TYPE } from "~/lib/constants";
import { formatMoney } from "~/lib/utils";
import useBookingSchema from "~/services/schema/booking.schema";
import type { Room } from "~/services/types/booking.types";
export default function RoomDataTable({
  onRoomSelect,
  rooms,
  form,
  nextStep,
  ...props
}: React.ComponentProps<"table"> & {
  onRoomSelect: (suggestedRoom: Room, quantity?: number) => void;
  rooms: Room[];
  form?: any;
  nextStep?: () => void;
}) {
  const handleAddRoom = (room: Room) => {
    onRoomSelect(room, room.quantity || 1);
    if (form) {
      form.trigger("roomSelection.rooms");
      nextStep && nextStep();
    }
  };
  return (
    <Table {...props}>
      <TableHeader>
        <TableRow className="h-16 ">
          <TableHead className="w-20 rounded-s-md">Ảnh</TableHead>
          <TableHead>Tên phòng</TableHead>
          <TableHead className="text-center w-24">
            <Select>
              <SelectTrigger id="room-type" className="w-32 bg-white">
                <SelectValue placeholder="Loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPE.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableHead>
          <TableHead className="text-center w-24">Trạng thái</TableHead>
          <TableHead className="text-center w-24">Số lượng</TableHead>
          <TableHead className="text-center w-24 rounded-e-md">
            Tổng cộng
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!!rooms &&
          rooms.length > 0 &&
          rooms.map((room) => (
            <TableRow key={room.roomId}>
              <TableCell className="font-medium">
                <Image
                  src={room.images?.[0] ?? ""}
                  alt={room.roomName}
                  width={100}
                  height={100}
                />
              </TableCell>
              <TableCell>
                <h1>{room.roomName}</h1>
                <p className="text-sm text-muted-foreground">
                  {room.description}
                </p>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={"default"}>{room.roomType}</Badge>
              </TableCell>
              <TableCell className="text-center">{room.status}</TableCell>
              <TableCell className="text-center">{room.quantity}</TableCell>
              <TableCell className="text-center space-y-2">
                <data className="block">
                  {formatMoney(room.price).vndFormatted}
                </data>
                <Button onClick={() => handleAddRoom(room)} className="w-fit">
                  Thêm phòng
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
