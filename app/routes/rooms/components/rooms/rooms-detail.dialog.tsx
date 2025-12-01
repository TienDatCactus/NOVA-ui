import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import BookingHistory from "../../fragments/rooms/booking-history.tab";
import RoomDetailTab from "../../fragments/rooms/detail.tab";
interface RoomDetailRowProps {
  roomId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RoomDetailDialog({ roomId, onOpenChange, open }: RoomDetailRowProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
          <Button variant={"outline"} onClick={() => onOpenChange?.(false)}>
            Thoát
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoomDetailDialog;
