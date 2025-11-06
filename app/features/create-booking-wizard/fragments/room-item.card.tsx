import { X, BedDouble } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "~/components/ui/card";
import { formatMoney } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import ImageWithFallback from "~/components/ui/image";

interface RoomItemCardProps {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  dailyPrice: number;
  imageUrl?: string;
}

/**
 * Minimal room item card for booking dialog
 * Displays room info and allows removal
 */
export default function RoomItemCard({
  roomId,
  roomName,
  roomTypeName,
  dailyPrice,
  imageUrl,
}: RoomItemCardProps) {
  const { data: storeData, setData } = useCreateBookingStore();

  const handleRemove = () => {
    const updatedRoomIds = (storeData.roomIds || []).filter(
      (id) => id !== roomId
    );
    setData({ roomIds: updatedRoomIds });
  };

  return (
    <Card className="bg-accent snap-center hover:border-primary border hover:shadow-md transition-shadow duration-150 ease-in-out">
      <CardHeader>
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={imageUrl || ""}
            alt={roomName}
            className="h-16 object-cover rounded-md"
          />
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 min-w-0 text-accent-foreground">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-tight truncate">{roomName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {roomTypeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-primary">
            {formatMoney(dailyPrice).vndFormatted}
            <span className="text-xs text-muted-foreground font-normal">
              /đêm
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
