"use client";

import {
  Bed,
  DoorOpen,
  ImageIcon,
  MoreHorizontal,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import type z from "zod";
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
import { Skeleton } from "~/components/ui/skeleton";
import Image from "~/components/ui/image";
import { formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/schema/room.schema";
import { cn } from "~/lib/utils";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";

const { AvailableRoomItemSchema } = RoomSchema;

type RoomTypeCardProps = {
  roomType: z.infer<typeof AvailableRoomItemSchema>;
  onBookNow?: (roomTypeId: string, roomId?: string) => void;
  onViewDetails?: (roomTypeId: string) => void;
};

/**
 * Card hiển thị room type với thông tin chi tiết
 * Fetch room details để hiển thị hình ảnh và thông tin đầy đủ
 */
function RoomTypeCard({
  roomType,
  onBookNow,
  onViewDetails,
}: RoomTypeCardProps) {
  const [imageError, setImageError] = useState(false);

  // Fetch details of the first available room to get images
  const firstAvailableRoom = roomType.availableRooms[0];
  const { data: roomDetail, isPending: isLoadingDetail } = useRoomDetail({
    id: firstAvailableRoom?.roomId,
  });

  const handleBookNow = () => {
    onBookNow?.(roomType.roomTypeId, firstAvailableRoom?.roomId);
  };

  const handleViewDetails = () => {
    onViewDetails?.(roomType.roomTypeId);
  };

  return (
    <Card className="max-w-md pt-0">
      <CardContent className="px-0">
        <div className="relative h-48 bg-muted overflow-hidden">
          {isLoadingDetail ? (
            <Skeleton className="w-full h-full" />
          ) : roomDetail?.imageUrls &&
            roomDetail.imageUrls.length > 0 &&
            !imageError ? (
            <>
              <Image
                src={roomDetail.imageUrls[0]}
                alt={roomType.roomTypeName}
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
              {roomDetail.imageUrls.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  +{roomDetail.imageUrls.length - 1} ảnh
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={roomType.availableCount > 0 ? "success" : "info"}>
              {roomType.availableCount} phòng trống
            </Badge>
          </div>

          {/* Room Type Code Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90">
              {roomType.roomTypeCode}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{roomType.roomTypeName}</CardTitle>
            <CardDescription className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                {roomType.totalRooms} phòng
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Tối đa {roomType.maxOccupancy} khách
              </span>
            </CardDescription>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewDetails}>
                  <DoorOpen className="h-4 w-4 mr-2" />
                  Xem chi tiết loại phòng
                </DropdownMenuItem>
                {roomType.availableCount > 0 && (
                  <DropdownMenuItem onClick={handleBookNow}>
                    <User className="h-4 w-4 mr-2" />
                    Đặt phòng
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        {roomType.availableRooms.length > 0 && (
          <div className="rounded-md border p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Phòng trống:
            </p>
            <div className="flex flex-wrap gap-1">
              {roomType.availableRooms.slice(0, 6).map((room) => (
                <Badge key={room.roomId} variant="warning" className="text-xs">
                  {room.roomName}
                </Badge>
              ))}
              {roomType.availableRooms.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{roomType.availableRooms.length - 6} phòng
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Giá/đêm</span>
          <span className="text-lg font-bold text-primary">
            {formatMoney(roomType.baseRatePerNight).vndFormatted}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-3 max-sm:flex-col max-sm:items-stretch">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleViewDetails}
        >
          Chi tiết
        </Button>
        {roomType.availableCount > 0 && (
          <Button size="sm" className="flex-1" onClick={handleBookNow}>
            Đặt ngay
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default RoomTypeCard;
