import { DollarSign, FolderCode } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useRoomDetail } from "../../container/rooms/query.hooks";
interface RoomDetailTabProps {
  roomId: string;
}

function RoomDetailTab({ roomId }: RoomDetailTabProps) {
  const { data: roomDetail, isLoading } = useRoomDetail({
    id: roomId,
  });
  if (!roomDetail) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>Không có thông tin</EmptyTitle>
          <EmptyDescription>
            Không có thông tin chi tiết cho phòng này. Hãy thử một phòng khác.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  if (isLoading)
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  return (
    <div className="flex gap-4">
      <Card>
        <CardContent>
          <ImageZoom>
            <Image
              src={roomDetail.imageUrls[0]}
              alt={roomDetail.roomName}
              width={300}
              height={240}
              className="w-full h-full object-cover rounded-md"
            />
          </ImageZoom>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-muted-foreground uppercase font-medium ">
            Chi tiết phòng : {roomDetail.roomName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-1">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Loại phòng:</span>
              <p className="font-semibold">{roomDetail.roomTypeName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">Mã loại phòng:</span>
              <p className="font-mono ">{roomDetail.roomTypeId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Giá/đêm:
              </span>
              <p className="font-bold text-primary">
                {formatMoney(roomDetail.dailyPrice).vndFormatted}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">ID Phòng:</span>
              <p className="font-mono">{roomDetail.roomId}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Trạng thái hiện tại:
            </span>
            <Badge variant="info">
              {RoomStatusEnum[roomDetail.status as keyof typeof RoomStatusEnum]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoomDetailTab;
