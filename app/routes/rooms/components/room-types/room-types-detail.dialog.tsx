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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Image from "~/components/ui/image";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatMoney } from "~/lib/utils";
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
  const subImages = sortedImages.slice(1, sortedImages.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
      >
        {/* === Header === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background border rounded-lg text-primary shadow-sm">
                <BedDouble className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-lg leading-none">
                  {roomTypeDetail.translations.find(
                    (t) => t.languageCode === "vi"
                  )?.name ||
                    roomTypeDetail.translations[0]?.name ||
                    ""}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-muted px-1.5 rounded border text-foreground">
                    {roomTypeDetail.code}
                  </span>
                  {/* ID Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-mono text-xs">
                        ID: {roomTypeDetail.id}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </DialogDescription>
              </div>
            </div>

            {/* Status Badge (Top Right) */}
            <Badge
              variant={roomTypeDetail.active ? "outline" : "secondary"}
              className={`text-xs font-normal ${
                roomTypeDetail.active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {roomTypeDetail.active ? "Đang hoạt động" : "Tạm ngưng"}
            </Badge>
          </div>
        </DialogHeader>

        {/* === Body (Split View) === */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0 bg-background">
          {/* LEFT COLUMN: Visual Gallery (60%) */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-border/50">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Thư viện ảnh (
                {sortedImages.length})
              </h4>

              {mainImage ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-muted shadow-sm group">
                    <ImageZoom>
                      <Image
                        src={mainImage.url}
                        alt="Main view"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </ImageZoom>
                  </div>

                  {subImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {subImages.map((img) => (
                        <div
                          key={img.mediaId}
                          className="relative rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        >
                          <ImageZoom>
                            <Image
                              src={img.url}
                              alt="Sub view"
                              className="object-cover aspect-square "
                            />
                          </ImageZoom>
                        </div>
                      ))}
                      {sortedImages.length > 6 && (
                        <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          +{sortedImages.length - 6}
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
          </div>

          {/* RIGHT COLUMN: Metrics & Info (40%) */}
          <ScrollArea className="w-full md:w-[320px] bg-muted/10">
            <div className="p-6 space-y-6">
              {/* Pricing Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5" /> Thông tin giá
                </h4>
                <div className="bg-background rounded-lg border p-4 shadow-sm">
                  <span className="text-xs text-muted-foreground">
                    Giá niêm yết / đêm
                  </span>
                  <div className="text-2xl font-bold text-primary font-mono mt-1">
                    {formatMoney(roomTypeDetail.baseRate).vndFormatted}
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Occupancy Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Sức chứa
                </h4>
                <div className="bg-background rounded-lg border p-4 shadow-sm flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">
                    {roomTypeDetail.maxOccupancy}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Người lớn
                  </span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Description Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" /> Mô tả
                </h4>
                <div
                  className="text-sm text-foreground/80 leading-relaxed bg-background p-4 rounded-lg border text-justify"
                  dangerouslySetInnerHTML={{
                    __html:
                      roomTypeDetail.translations.find(
                        (t) => t.languageCode === "vi"
                      )?.description ||
                      roomTypeDetail.translations[0]?.description ||
                      "<em class='text-muted-foreground text-xs'>Chưa có mô tả chi tiết cho loại phòng này.</em>",
                  }}
                />
              </div>

              {/* Metadata Footer */}
              <div className="pt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                <span>
                  Đã tạo:{" "}
                  {format(
                    new Date(roomTypeDetail.createdAt),
                    "HH:mm dd/MM/yyyy",
                    {
                      locale: vi,
                    }
                  )}
                </span>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* === Footer === */}
        <DialogFooter className="p-4 border-t bg-background shrink-0">
          <DialogClose asChild>
            <Button variant="outline" className="min-w-[100px]">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoomTypesDetailDialog;
