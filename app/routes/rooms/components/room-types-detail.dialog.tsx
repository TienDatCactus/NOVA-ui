import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Bath,
  Calendar,
  DollarSign,
  FileText,
  FolderCode,
  ImageIcon,
  Info,
  Users,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useRoomTypeDetail } from "../container/room-types-query.hooks";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "~/components/ui/empty";

interface RoomTypesDetailDialogProps {
  roomTypeId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RoomTypesDetailDialog({
  roomTypeId,
  open,
  onOpenChange,
}: RoomTypesDetailDialogProps) {
  const { data: roomTypeDetail, isLoading } = useRoomTypeDetail({
    id: roomTypeId,
    open: !!open,
  });
  if (!roomTypeDetail) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>Không có thông tin</EmptyTitle>
          <EmptyDescription>
            Không có thông tin chi tiết cho loại phòng này. Hãy thử một phòng
            khác.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bath className="h-5 w-5" />
                {roomTypeDetail.name}
                <p className="text-sm text-muted-foreground  font-mono">
                  {roomTypeDetail.code}
                </p>
              </CardTitle>
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 border p-4 shadow-s rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Giá cơ bản/đêm</span>
              </div>
              <p className="text-xl font-bold text-primary">
                {formatMoney(roomTypeDetail.baseRate).vndFormatted}
              </p>
            </div>

            <div className="space-y-2 border  shadow-s p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Sức chứa tối đa</span>
              </div>
              <p className="text-xl font-bold">
                {roomTypeDetail.maxOccupancy} người
              </p>
            </div>

            <div className="space-y-2 border shadow-s p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>Ngày tạo</span>
              </div>
              <p className="text-sm font-medium pt-1.5">
                {format(parseISO(roomTypeDetail.createdAt), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="relative group">
                <Image
                  src={sortedImages[0].url}
                  alt={sortedImages[0].caption || roomTypeDetail.name}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
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
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
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
                          className="w-[300px] h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        />
                        {/* Display Order Badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs"
                        >
                          #{image.displayOrder}
                        </Badge>
                      </div>
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

      {sortedImages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2  border-dashed py-12 text-muted-foreground">
          <ImageIcon className="h-12 w-12 opacity-30" />
          <p className="text-sm">Chưa có ảnh cho loại phòng này</p>
        </div>
      )}
    </div>
  );
}

export default RoomTypesDetailDialog;
