import { useState } from "react";
import { format } from "date-fns";
import { Plus, BedDouble } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import ImageWithFallback from "~/components/ui/image";

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableRooms: any[];
  isLoading: boolean;
  onAddRoom: (roomId: string, roomTypeId: string) => void;
}

export function AddRoomModal({
  open,
  onOpenChange,
  availableRooms,
  isLoading,
  onAddRoom,
}: AddRoomModalProps) {
  const [addingRoomId, setAddingRoomId] = useState<string | null>(null);

  const handleAddRoom = (roomId: string, roomTypeId: string) => {
    setAddingRoomId(roomId);
    onAddRoom(roomId, roomTypeId);

    // Reset after a short delay to show feedback
    setTimeout(() => {
      setAddingRoomId(null);
      onOpenChange(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Thêm phòng vào đặt phòng</DialogTitle>
          <DialogDescription>
            Chọn một phòng khả dụng để thêm vào đặt phòng này
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="w-32 h-24 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableRooms && availableRooms.length > 0 ? (
            <div className="space-y-6">
              {availableRooms.map((roomType) => (
                <div key={roomType.roomTypeId} className="space-y-3">
                  {/* Room Type Header */}
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {roomType.roomTypeName}
                    </h3>
                    <Badge variant="secondary">
                      {roomType.availableRooms.length} phòng trống
                    </Badge>
                  </div>

                  {/* Available Rooms in this Type */}
                  <div className="grid gap-3">
                    {roomType.availableRooms.map((room: any) => (
                      <Card
                        key={room.roomId}
                        className="overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Room Image */}
                            <div className="flex-shrink-0">
                              <ImageWithFallback
                                src={room.imageUrls?.[0] || ""}
                                alt={room.roomName}
                                className="w-32 h-24 object-cover rounded-md"
                              />
                            </div>

                            {/* Room Details */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="font-semibold text-base">
                                  {room.roomName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {roomType.roomTypeName}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Giá/đêm:{" "}
                                  </span>
                                  <span className="font-semibold text-primary">
                                    {
                                      formatMoney(room.dailyPrice || 0)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>
                                <Separator
                                  orientation="vertical"
                                  className="h-4"
                                />
                                <Badge
                                  variant={
                                    room.status === "Available"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {room.status || "Khả dụng"}
                                </Badge>
                              </div>
                            </div>

                            {/* Add Button */}
                            <div className="flex items-center">
                              <Button
                                onClick={() =>
                                  handleAddRoom(
                                    room.roomId,
                                    roomType.roomTypeId
                                  )
                                }
                                disabled={addingRoomId === room.roomId}
                                size="sm"
                              >
                                {addingRoomId === room.roomId ? (
                                  "Đang thêm..."
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Thêm
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {roomType !== availableRooms[availableRooms.length - 1] && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không có phòng trống khả dụng
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Vui lòng thử lại với khoảng thời gian khác
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
