import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  FileText,
  Hash,
  ImageIcon,
  Info,
  Layers,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Image from "~/components/ui/image";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useServiceTypeDetails } from "../../container/service-types/query.hooks";

interface ServiceTypeDetailRowProps {
  type: ServiceTypeItem;
}

export default function ServiceTypeDetailRow({
  type,
}: ServiceTypeDetailRowProps) {
  // Luôn lấy data mới nhất để đảm bảo tính chính xác khi audit
  const { data: detailData, isPending } = useServiceTypeDetails(type.id);

  // --- LOADING SKELETON (3 Cột) ---
  if (isPending) {
    return (
      <div className="p-6 border-t bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!detailData) return null;

  const hasImages = detailData.images && detailData.images.length > 0;

  return (
    <div className="group relative bg-background border-t hover:bg-muted/5 transition-colors duration-200">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* === CỘT 1: HÌNH ẢNH (VISUAL IDENTIFIER) - 25% === */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Hình ảnh
            </h4>
            {hasImages ? (
              <div className="relative w-full aspect-square bg-muted rounded-xl overflow-hidden border shadow-sm">
                <Carousel className="w-full h-full">
                  <CarouselContent>
                    {detailData.images?.map((img, index) => (
                      <CarouselItem key={index} className="basis-full">
                        <ImageZoom>
                          <Image
                            src={img.url}
                            alt={`${detailData.name} - ${index + 1}`}
                            className="w-full h-full aspect-square object-cover"
                          />
                        </ImageZoom>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {/* Navigation nhỏ gọn, nằm đè lên ảnh để tiết kiệm diện tích */}
                  {detailData.images!.length > 1 && (
                    <>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                        <CarouselPrevious className="h-8 w-8 bg-background/80 hover:bg-background border-none shadow-md" />
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                        <CarouselNext className="h-8 w-8 bg-background/80 hover:bg-background border-none shadow-md" />
                      </div>
                    </>
                  )}
                </Carousel>
              </div>
            ) : (
              <div className="aspect-square w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 text-muted-foreground/50">
                <ImageIcon className="h-10 w-10 mb-2" />
                <span className="text-xs font-medium">Không có ảnh</span>
              </div>
            )}
          </div>

          {/* === CỘT 2: THÔNG TIN ĐỊNH DANH (CORE DATA) - 33% === */}
          <div className="lg:col-span-4 flex flex-col gap-5 border-l border-dashed pl-8 border-border/60">
            {/* Identity Block */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Thông tin định danh
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase">
                    Tên loại dịch vụ
                  </label>
                  <div className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    {detailData.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium uppercase">
                      Mã code
                    </label>
                    <div className="font-mono text-sm font-medium bg-muted/50 px-2 py-1 rounded w-fit flex items-center gap-1 mt-1">
                      <Hash className="w-3 h-3 opacity-50" />
                      {detailData.code}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium uppercase">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={detailData.active ? "success" : "secondary"}
                        className="rounded-md font-normal"
                      >
                        {detailData.active
                          ? "Đang hoạt động"
                          : "Ngưng hoạt động"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps Block */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <CalendarDays className="w-3.5 h-3.5" /> Ngày tạo
                </span>
                <span className="font-medium font-mono text-xs">
                  {detailData.createdAt
                    ? format(
                        new Date(detailData.createdAt),
                        " HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5" /> Cập nhật
                </span>
                <span className="font-medium font-mono text-xs">
                  {detailData.updatedAt
                    ? format(
                        new Date(detailData.updatedAt),
                        " HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* === CỘT 3: MÔ TẢ & NGỮ CẢNH (CONTEXT) - 42% === */}
          <div className="lg:col-span-5 flex flex-col gap-2 border-l border-dashed pl-8 border-border/60 h-full">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Mô tả chi tiết
            </h4>

            <div
              className={cn(
                "flex-1 rounded-xl shadow-sm bg-background border p-4 text-sm leading-relaxed",
                detailData.description
                  ? "bg-muted/20 text-foreground"
                  : "bg-muted/10 text-muted-foreground italic flex items-center justify-center"
              )}
            >
              {detailData.description || "Chưa có mô tả cho loại dịch vụ này."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
