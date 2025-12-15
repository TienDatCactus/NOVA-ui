import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BedDouble, Loader2, Plus, SearchX, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (roomId: string) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function AddRoomModal({
  open,
  onOpenChange,
  onAddRoom,
  bookingDetail,
}: AddRoomModalProps) {
  const [addingRoomId, setAddingRoomId] = useState<string | null>(null);

  const checkInStr = bookingDetail?.checkinDate
    ? format(bookingDetail.checkinDate, "yyyy-MM-dd")
    : "";
  const checkOutStr = bookingDetail?.checkoutDate
    ? format(bookingDetail.checkoutDate, "yyyy-MM-dd")
    : "";
  const displayDateRange =
    bookingDetail?.checkinDate && bookingDetail?.checkoutDate
      ? `${format(bookingDetail.checkinDate, "dd/MM", { locale: vi })} - ${format(bookingDetail.checkoutDate, "dd/MM", { locale: vi })}`
      : "";

  const { data: availableRooms, isPending: isLoading } =
    useAvailableRoomsInternal(
      {
        CheckInDate: checkInStr,
        CheckOutDate: checkOutStr,
        Guests: (bookingDetail?.adults || 1) + (bookingDetail?.children || 0),
      },
      open
    );

  const handleAddRoom = async (roomId: string) => {
    try {
      setAddingRoomId(roomId);
      onAddRoom(roomId);
    } catch (error) {
      console.error(error);
    } finally {
      setAddingRoomId(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0 bg-background">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary" />
                Thêm phòng trống
              </DialogTitle>
              <DialogDescription>
                Tìm thấy phòng khả dụng cho giai đoạn{" "}
                <span className="font-medium text-foreground">
                  {displayDateRange}
                </span>
              </DialogDescription>
            </div>
            {availableRooms && (
              <Badge variant="secondary" className="h-7 px-3">
                Tổng{" "}
                {availableRooms.reduce(
                  (acc, curr) => acc + curr.availableCount,
                  0
                )}{" "}
                phòng trống
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* === BODY === */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : availableRooms && availableRooms.length > 0 ? (
          <div className="space-y-10 py-4 px-6">
            {availableRooms.map((roomType) => (
              <div
                key={roomType.roomTypeId}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="flex items-end justify-between border-b pb-2">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {roomType.roomTypeName}
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-muted-foreground border-dashed"
                      >
                        {roomType.roomTypeCode}
                      </Badge>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Max {roomType.maxOccupancy}</span>
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="font-mono font-medium text-foreground">
                        {formatMoney(roomType.baseRatePerNight).vndFormatted}
                        /đêm
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Layout for Rooms */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {roomType.availableRooms.map((room) => {
                    const isAdding = addingRoomId === room.roomId;

                    return (
                      <button
                        key={room.roomId}
                        onClick={() => handleAddRoom(room.roomId)}
                        disabled={isAdding}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
                          "hover:border-primary hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isAdding
                            ? "bg-primary/5 border-primary/50 cursor-wait"
                            : "bg-card border-border"
                        )}
                      >
                        {/* Room Number */}
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {room.roomName}
                        </span>

                        {/* Status / Action Text */}
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-medium">
                          {isAdding ? (
                            <span className="flex items-center gap-1 text-primary">
                              <Loader2 className="w-3 h-3 animate-spin" /> Đang
                              thêm
                            </span>
                          ) : (
                            <span className="group-hover:text-primary flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Chọn
                            </span>
                          )}
                        </span>

                        {/* Status Indicator Dot */}
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="h-full flex flex-col items-center justify-center py-12 text-center">
            <EmptyHeader>
              <EmptyMedia className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <SearchX className="h-10 w-10 text-muted-foreground/50" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-semibold text-foreground">
                Không tìm thấy phòng trống
              </EmptyTitle>
              <EmptyDescription className="text-muted-foreground max-w-sm mt-2">
                Rất tiếc, không có phòng nào phù hợp cho khoảng thời gian
                <span className="font-medium text-foreground mx-1">
                  {displayDateRange}
                </span>
                .
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => onOpenChange(false)}
              >
                Đóng cửa sổ
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </DialogContent>
    </Dialog>
  );
}
