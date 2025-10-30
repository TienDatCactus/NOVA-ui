import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Bath,
  Calendar1,
  DollarSign,
  FileText,
  FolderCode,
  ImageIcon,
  Info,
  Users,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import Image from "~/components/ui/image";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";
import { useRoomTypeDetail } from "../container/room-types-query.hooks";

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
    <div className="flex flex-col overflow-y-auto">
      <DialogHeader className="px-2 mb-0">
        <DialogTitle>Chi tiết hạng phòng</DialogTitle>
        <div className="flex-shrink-0  ">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="gradient" className="w-10 h-10">
                <Bath className="h-5 w-5 " />
              </Button>
              <div>
                <div className="flex gap-1">
                  <h3 className="text-xl font-semibold">
                    {roomTypeDetail.name}
                  </h3>
                  <sub className="text-xs text-muted-foreground">
                    {roomTypeDetail.code}
                  </sub>
                </div>
                <Badge variant={"outline"}>{roomTypeDetail.id}</Badge>
              </div>
            </div>
            <Badge
              variant={roomTypeDetail.active ? "default" : "secondary"}
              className="text-xs"
            >
              {roomTypeDetail.active ? "Đang hoạt động" : "Tạm ngừng"}
            </Badge>
          </div>
        </div>
      </DialogHeader>
      <Separator className="my-4" />
      <Tabs defaultValue="info" className="flex-1 px-2 flex flex-col ">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="info" className="gap-2">
            <Info className="h-4 w-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Thư viện ảnh ({sortedImages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="info"
          className="flex-1 overflow-y-auto space-y-4 pr-1"
        >
          <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
            <div className="flex flex-col gap-2 col-span-1">
              <Card className="bg-secondary p-4">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar1 className="h-4 w-4" />
                      <span>Ngày tạo</span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {format(roomTypeDetail.createdAt, "hh:mm yyyy/MM/dd", {
                        locale: vi,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary p-4">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Giá cơ bản/đêm</span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {formatMoney(roomTypeDetail.baseRate).vndFormatted}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary p-4">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 " />
                      <span>Sức chứa</span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {roomTypeDetail.maxOccupancy} người
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {roomTypeDetail.description && (
              // 1. Use a simple `div` with the layered styling.
              // We use `bg-secondary` to create a distinct layer.
              <div className="col-span-2 space-y-3 rounded-lg bg-secondary p-4">
                {/* 2. Simplified Header */}
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  <span>Mô tả</span>
                </div>

                {/* 3. Prose Content */}
                {/* We keep pl-6 to indent the content relative to the title */}
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed pl-6"
                  dangerouslySetInnerHTML={{
                    __html: roomTypeDetail.description,
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="gallery"
          className="flex-1 overflow-y-auto mt-4 pr-1"
        >
          {sortedImages.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>Chưa có ảnh</EmptyTitle>
                <EmptyDescription>
                  Loại phòng này chưa có hình ảnh nào
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedImages.map((image, index) => (
                <div
                  key={image.mediaId}
                  className="group relative aspect-video cursor-pointer overflow-hidden border shadow-sm hover:shadow-md rounded-md transition-all"
                >
                  <ImageZoom>
                    <Image
                      src={image.url}
                      alt={
                        image.caption || `${roomTypeDetail.name} ${index + 1}`
                      }
                      className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-md"
                    />
                  </ImageZoom>

                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 text-xs"
                  >
                    #{image.displayOrder}
                  </Badge>

                  {image.caption && (
                    <div className="absolute rounded-e-md bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white line-clamp-2">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RoomTypesDetailDialog;
