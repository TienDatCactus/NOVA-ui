import { BedDouble, StarIcon, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "~/components/ui/image";
import { formatMoney } from "~/lib/utils";
import type { RoomDetailResponseDto } from "~/services/api/rooms/dto";
import { useCreateBookingStore } from "~/store/create-booking.store";

interface RoomItemCardProps {
  roomDetail: RoomDetailResponseDto;
}

export default function RoomItemCard({ roomDetail }: RoomItemCardProps) {
  const { data: storeData, setData } = useCreateBookingStore();
  const { roomId, roomName, roomTypeName, dailyPrice, imageUrls } = roomDetail;
  const handleRemove = () => {
    const updatedRoomIds = (storeData.roomIds || []).filter(
      (id) => id !== roomId
    );
    setData({ roomIds: updatedRoomIds });
  };
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow hover:border-primary p-0">
      <CardContent className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gray-100">
            <Image
              src={imageUrls?.[0] || ""}
              alt={roomName}
              width={80}
              height={80}
              className="w-full h-full object-contain rounded-md"
            />
          </div>

          <div>
            <CardTitle className="text-sm mb-1">{roomName}</CardTitle>
            <CardDescription className="text-xs mb-2 line-clamp-2">
              {roomTypeName}
            </CardDescription>
            <p className="text-sm font-bold">
              {formatMoney(dailyPrice).vndFormatted}
            </p>
          </div>
        </div>

        <Button
          onClick={handleRemove}
          size="sm"
          variant="destructive"
          className="text-xs px-2 py-1 h-7"
        >
          Xóa
        </Button>
      </CardContent>
    </Card>
  );
}
