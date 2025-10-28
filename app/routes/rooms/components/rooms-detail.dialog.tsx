import { DollarSign, FileText, FolderCode } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useRoomDetail } from "../container/rooms-query.hooks";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import BookingHistory from "../fragments/rooms/booking-history.tab";
import RoomDetailTab from "../fragments/rooms/room-detail.tab";
interface RoomDetailRowProps {
  roomId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RoomDetailDialog({ roomId, onOpenChange, open }: RoomDetailRowProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Thông tin phòng</DialogTitle>
        <DialogDescription>Tổng hợp thông tin chi tiết.</DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Thông tin</TabsTrigger>
          <TabsTrigger value="booking-history">Lịch sử đặt phòng</TabsTrigger>
        </TabsList>
        <TabsContent value="detail">
          <RoomDetailTab roomId={roomId} />
        </TabsContent>
        <TabsContent value="booking-history">
          <BookingHistory roomId={roomId} />
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant={"destructive"} onClick={() => onOpenChange?.(false)}>
          Thoát
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default RoomDetailDialog;
