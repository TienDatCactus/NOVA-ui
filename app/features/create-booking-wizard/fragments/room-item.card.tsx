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
    <Card className="w-48 shadow-sm hover:shadow-md transition-shadow hover:border-primary p-0">
      <CardContent className="p-3">
        <div className="aspect-square rounded-md bg-gray-100 mb-2">
          <Image
            src={imageUrls?.[0] || ""}
            alt={roomName}
            height={160}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        <CardTitle className="text-sm mb-1">{roomName}</CardTitle>
        <CardDescription className="text-xs mb-2 line-clamp-2">
          {roomTypeName}
        </CardDescription>
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4].map((star) => (
              <StarIcon
                key={star}
                className="h-3 w-3 fill-yellow-400 text-yellow-400"
              />
            ))}
            <StarIcon className="h-3 w-3 text-gray-300" />
          </div>
          <span className="text-xs text-muted-foreground">(4.0)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{dailyPrice}</span>
          <Button
            onClick={handleRemove}
            size="sm"
            variant="destructive"
            className="text-xs px-2 py-1 h-7"
          >
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
