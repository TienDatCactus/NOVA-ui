import { BookMarked, DoorOpen, ImageIcon, MoreHorizontal } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "~/components/ui/image";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import { RoomSchema } from "~/services/api/rooms/room.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";

const { AvailableRoomItemSchema } = RoomSchema;

type RoomCardGridProps = {
  roomId: string;
};

function RoomCardGrid({ roomId }: RoomCardGridProps) {
  const { data: roomDetail, isPending: isLoadingDetail } = useRoomDetail({
    id: roomId,
  });

  return (
    <Card className="p-0 h-full">
      <CardContent className="px-0 py-0">
        <div className="relative h-48 group bg-muted overflow-hidden">
          {isLoadingDetail ? (
            <Skeleton className="w-full h-full" />
          ) : roomDetail?.imageUrls ? (
            <Image
              src={roomDetail.imageUrls[0]}
              alt={roomDetail.roomName || "Hình ảnh phòng"}
              className="w-full h-full object-cover  rounded-2xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          <div className="group-hover:hidden block px-4 py-2 absolute bottom-0">
            <h1 className="font-semibold text-2xl text-white">
              {roomDetail?.roomName}
            </h1>
          </div>
          <div className="hidden group-hover:block absolute inset-0 bg-black/30 rounded-2xl p-4">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-2 text-white">
                  <h1 className="text-lg font-semibold">
                    {roomDetail?.roomName}
                  </h1>
                  <p className="font-mono">{roomDetail?.roomTypeName}</p>
                </div>
                <Badge>
                  {
                    RoomStatusEnum[
                      roomDetail?.status! as keyof typeof RoomStatusEnum
                    ]
                  }
                </Badge>
              </div>
              <div className="flex items-end justify-between">
                <data className="font-mono text-white">
                  {formatMoney(roomDetail?.dailyPrice || 0).vndFormatted}
                </data>

                <Button variant={"outline"}>
                  <BookMarked />
                  Đặt phòng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoomCardGrid;
