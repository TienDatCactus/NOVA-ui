import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Hotel, User, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

type BookingRoom = {
  bookingRoomId: string;
  roomId: string;
  roomName: string;
  guestName?: string;
  isPrimary?: boolean;
};

type RoomSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingCode: string;
  customerName: string;
  rooms: BookingRoom[];
  onSelect: (bookingRoomId: string, roomName: string) => void;
};

export default function RoomSelectionDialog({
  open,
  onOpenChange,
  bookingCode,
  customerName,
  rooms,
  onSelect,
}: RoomSelectionDialogProps) {
  const handleSelectRoom = (room: BookingRoom) => {
    onSelect(room.bookingRoomId, room.roomName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Hotel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Chọn phòng để tính tiền</DialogTitle>
              <DialogDescription>
                {bookingCode} - {customerName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Booking này có {rooms.length} phòng. Vui lòng chọn phòng để tính
              tiền:
            </p>

            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.bookingRoomId}
                    onClick={() => handleSelectRoom(room)}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                      <Hotel className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{room.roomName}</p>
                        {room.isPrimary && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Phòng chính
                          </Badge>
                        )}
                      </div>
                      {room.guestName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {room.guestName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
