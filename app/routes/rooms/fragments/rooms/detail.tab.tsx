import { DollarSign, FileText, FolderCode } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";
import { useRoomDetail } from "../../container/rooms-query.hooks";
interface RoomDetailTabProps {
  roomId: string;
}

function RoomDetailTab({ roomId }: RoomDetailTabProps) {
  console.log(roomId);
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
        <CardContent className="">
          <Image
            src={roomDetail.imageUrls[0]}
            alt={roomDetail.roomName}
            width={300}
            height={200}
            className="w-full h-full object-cover rounded-md"
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Chi tiết phòng : {roomDetail.roomName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Loại phòng:</span>
              <p className="font-semibold">{roomDetail.roomTypeName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">Mã loại phòng:</span>
              <p className="font-mono">{roomDetail.roomTypeId}</p>
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

          {/* Status Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Trạng thái hiện tại:
            </span>
            <Badge variant="info">{roomDetail.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoomDetailTab;
