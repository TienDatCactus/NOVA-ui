import {
  AlignLeft,
  Barcode,
  CheckCircle2,
  Coins,
  ImageIcon,
  Layers,
  Package,
  Tag,
  XCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney, cn } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import { useServiceDetail } from "../../container/services/query.hooks";

interface ServiceDetailRowProps {
  service: ServiceItem;
}

export default function ServiceDetailRow({ service }: ServiceDetailRowProps) {
  const { data: serviceItemDetail, isPending } = useServiceDetail(
    service.serviceItemId
  );

  const hasImages =
    Array.isArray(service.imageUrls) && service.imageUrls.length > 0;
  const mainImage = hasImages ? service.imageUrls![0] : null;
  const subImages = hasImages ? service.imageUrls!.slice(1, 4) : [];

  if (isPending) {
    return (
      <div className="p-6 bg-muted/10 border-t animate-pulse">
        <div className="flex gap-6">
          <Skeleton className="h-40 w-40 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 border-t p-6 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* === LEFT: VISUAL GALLERY === */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          {mainImage ? (
            <div className="space-y-3">
              <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-sm">
                <ImageZoom>
                  <Image
                    src={mainImage}
                    alt={service.name}
                    className="h-full  aspect-square w-full object-contain transition-transform hover:scale-105 duration-500"
                  />
                </ImageZoom>
              </div>
              {/* Sub Images Grid */}
              {subImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {subImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-md overflow-hidden border bg-background cursor-pointer hover:ring-2 ring-primary/20 transition-all"
                    >
                      <ImageZoom>
                        <Image
                          src={img}
                          alt="sub"
                          className="h-full w-full object-cover"
                        />
                      </ImageZoom>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-20" />
              <span className="text-xs mt-2 font-medium">Không có ảnh</span>
            </div>
          )}
        </div>

        {/* === RIGHT: INFORMATION === */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Column 1: Core Details */}
          <div className="space-y-6">
            {/* Header Group */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Thông tin cơ bản
              </h4>

              <div className="space-y-4">
                {/* Code */}
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Barcode className="w-4 h-4 opacity-70" /> Mã dịch vụ
                  </span>
                  <span className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border">
                    {service.code}
                  </span>
                </div>

                {/* Type */}
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 opacity-70" /> Loại dịch vụ
                  </span>
                  <span className="font-medium text-foreground">
                    {serviceItemDetail?.serviceTypeName || "—"}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    {service.active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    Trạng thái
                  </span>
                  <Badge
                    variant={service.active ? "outline" : "secondary"}
                    className={cn(
                      "font-normal",
                      service.active
                        ? "border-green-200 text-green-700 bg-green-50"
                        : "text-muted-foreground"
                    )}
                  >
                    {service.active ? "Đang hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Pricing & Description */}
          <div className="space-y-6">
            {/* Pricing Box */}
            <div className="bg-background rounded-xl border p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5" /> Định giá
              </h4>
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>Đơn vị tính:</span>
                  <span className="font-medium text-foreground">
                    {service.unitName}
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary font-mono tracking-tight">
                  {formatMoney(service.basePrice).vndFormatted}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" /> Mô tả
              </h4>
              <ScrollArea className="h-[120px] w-full rounded-md border bg-background/50 p-3">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {service.description || (
                    <span className="italic opacity-50">
                      Chưa có mô tả chi tiết cho dịch vụ này.
                    </span>
                  )}
                </p>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
