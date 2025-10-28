import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Users,
  DollarSign,
  FileText,
  Calendar,
  ImageIcon,
  Info,
} from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { formatMoney } from "~/lib/utils";
import useRoomTypesSchema from "~/services/schema/room-types.schema";

const { RoomTypesDetailResponseSchema } = useRoomTypesSchema();

interface RoomTypesDetailRowProps {
  roomTypeDetail: z.infer<typeof RoomTypesDetailResponseSchema>;
  isLoading: boolean;
}

function RoomTypesDetailRow({
  roomTypeDetail,
  isLoading,
}: RoomTypesDetailRowProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const sortedImages = [...roomTypeDetail.images].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {roomTypeDetail.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {roomTypeDetail.code}
              </p>
            </div>
            <Badge
              variant={roomTypeDetail.active ? "default" : "secondary"}
              className="text-xs"
            >
              {roomTypeDetail.active ? "Đang hoạt động" : "Tạm ngừng"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {roomTypeDetail.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Mô tả</span>
              </div>
              <p className="text-sm leading-relaxed pl-6">
                {roomTypeDetail.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Key Info Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Giá cơ bản/đêm</span>
              </div>
              <p className="text-xl font-bold text-primary pl-6">
                {formatMoney(roomTypeDetail.baseRate).vndFormatted}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Sức chứa tối đa</span>
              </div>
              <p className="text-xl font-bold pl-6">
                {roomTypeDetail.maxOccupancy} người
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Ngày tạo</span>
              </div>
              <p className="text-sm font-medium pl-6">
                {format(parseISO(roomTypeDetail.createdAt), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Gallery Card */}
      {sortedImages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Thư viện ảnh ({sortedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedImages.length === 1 ? (
              // Single Image - Full Width
              <div className="relative group">
                <Image
                  src={sortedImages[0].url}
                  alt={sortedImages[0].caption || roomTypeDetail.name}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {sortedImages[0].caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 rounded-b-lg">
                    <p className="text-xs text-center">
                      {sortedImages[0].caption}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Multiple Images - Horizontal Scroll Gallery
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-4">
                  {sortedImages.map((image, index) => (
                    <div
                      key={image.mediaId}
                      className="relative inline-block flex-shrink-0 group"
                    >
                      <div className="relative">
                        <Image
                          src={image.url}
                          alt={
                            image.caption ||
                            `${roomTypeDetail.name} ${index + 1}`
                          }
                          width={300}
                          height={200}
                          className="w-[300px] h-48 object-cover rounded-lg border-2 hover:border-primary transition-colors"
                        />
                        {/* Display Order Badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs"
                        >
                          #{image.displayOrder}
                        </Badge>
                      </div>
                      {/* Caption Overlay */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-center truncate">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Image Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {sortedImages.length > 1 && "Cuộn ngang để xem thêm ảnh"}
              </span>
              <span>ID: {roomTypeDetail.id}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for No Images */}
      {sortedImages.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-20" />
              <p className="text-sm">Chưa có ảnh cho loại phòng này</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RoomTypesDetailRow;
