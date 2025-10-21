import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Coffee, FileText } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { RoomDetailResponseDto } from "~/services/api/rooms/dto";

interface RoomDetailRowProps {
  roomDetail: RoomDetailResponseDto;
}

function RoomDetailRow({ roomDetail }: RoomDetailRowProps) {
  return (
    <div className="p-4 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Booking Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đang sử dụng:</span>
              <Badge
                variant={roomDetail.isOccupiedToday ? "default" : "outline"}
              >
                {roomDetail.isOccupiedToday ? "Có" : "Không"}
              </Badge>
            </div>
            {roomDetail.isOccupiedToday && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Từ:</span>
                  <span className="font-medium">
                    {format(parseISO(roomDetail.currentFrom), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đến:</span>
                  <span className="font-medium">
                    {format(parseISO(roomDetail.currentTo), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bữa sáng hôm nay:</span>
              <Badge
                variant={roomDetail.hasBreakfastToday ? "default" : "outline"}
              >
                {roomDetail.hasBreakfastToday ? "Có" : "Không"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Đặt phòng gần đây ({roomDetail.recentBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roomDetail.recentBookings.length > 0 ? (
              <div className="space-y-2">
                {roomDetail.recentBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.bookingRoomId}
                    className="text-xs p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">
                        ID: {booking.bookingId}
                      </span>
                      {booking.anyBreakfast && (
                        <Badge variant="outline" className="text-xs h-5">
                          <Coffee className="h-3 w-3 mr-1" />
                          {booking.breakfastDaysCount} ngày
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {format(parseISO(booking.fromDate), "dd/MM/yyyy")} →{" "}
                      {format(parseISO(booking.toDate), "dd/MM/yyyy")}
                    </div>
                    {booking.note && (
                      <p className="mt-1 text-muted-foreground italic">
                        {booking.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Chưa có đặt phòng gần đây
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RoomDetailRow;
