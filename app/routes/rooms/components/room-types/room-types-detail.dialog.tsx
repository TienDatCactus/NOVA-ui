import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BedDouble,
  CalendarDays,
  Coins,
  FileText,
  ImageIcon,
  Info,
  Users,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatMoney } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useRoomTypeDetail } from "../../container/room-types/query.hooks";

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

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="p-6 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          </div>
          <div className="md:col-span-8 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roomTypeDetail) return null;

  const sortedImages = [...roomTypeDetail.images].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
  const mainImage = sortedImages[0];
  const subImages = sortedImages.slice(1, 4); // Lấy tối đa 3 ảnh phụ để hiển thị nhanh

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-5xl  overflow-y-auto"
      >
        <DialogHeader className="border-b pb-2">
          <DialogTitle>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-none">
                    {roomTypeDetail.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 rounded border">
                      {roomTypeDetail.code}
                    </span>
                    <Badge
                      variant={roomTypeDetail.active ? "success" : "secondary"}
                      className="h-4 px-1.5 text-[10px] font-normal"
                    >
                      {roomTypeDetail.active ? "Hoạt động" : "Tạm ngưng"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* ID Tooltip (Technical Data) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">ID: {roomTypeDetail.id}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* === COL 1: VISUAL GALLERY (4 cols) === */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Thư viện ảnh (
                {sortedImages.length})
              </h4>

              {mainImage ? (
                <div className="space-y-2">
                  <div className="relative  w-full overflow-hidden rounded-xl border shadow-sm bg-muted">
                    <ImageZoom>
                      <Image
                        src={mainImage.url}
                        alt="Main view"
                        className="w-full aspect-video h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </ImageZoom>
                  </div>
                  {/* Sub Images Grid */}
                  {subImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {subImages.map((img) => (
                        <div
                          key={img.mediaId}
                          className="rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-80"
                        >
                          <ImageZoom>
                            <Image
                              src={img.url}
                              alt="Sub view"
                              className="w-full aspect-square h-full object-cover"
                            />
                          </ImageZoom>
                        </div>
                      ))}
                      {sortedImages.length > 4 && (
                        <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{sortedImages.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-20 mb-2" />
                  <span className="text-xs">Chưa cập nhật ảnh</span>
                </div>
              )}
            </div>

            {/* === COL 2: METRICS & DETAILS (7 cols) === */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-card shadow-sm flexflex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> Giá niêm yết / đêm
                  </span>
                  <div className="text-2xl font-black text-primary font-mono tracking-tight mt-1">
                    {formatMoney(roomTypeDetail.baseRate).vndFormatted}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Sức chứa tiêu chuẩn
                  </span>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {roomTypeDetail.maxOccupancy}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      Khách
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Description Block */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Mô tả chi tiết
                </h4>
                <div
                  className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-lg border border-transparent hover:border-border/50 transition-colors min-h-[100px]"
                  dangerouslySetInnerHTML={{
                    __html:
                      roomTypeDetail.description ||
                      "<em class='text-muted-foreground'>Chưa có mô tả</em>",
                  }}
                />
              </div>

              {/* Metadata Footer */}
              <div className="mt-auto pt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    Tạo:{" "}
                    {format(
                      new Date(roomTypeDetail.createdAt),
                      " HH:mm dd/MM/yyyy",
                      { locale: vi }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RoomTypesDetailDialog;
