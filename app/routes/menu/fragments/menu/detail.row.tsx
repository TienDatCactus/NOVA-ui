import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, Layers, LayoutGrid, Package, Tag } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { useMenuItemDetail } from "../../container/menu/query.hooks";

interface MenuDetailRowProps {
  menuItem: MenuListItemDto;
}

export default function MenuDetailRow({ menuItem }: MenuDetailRowProps) {
  const { data: detailData, isPending } = useMenuItemDetail(menuItem.itemId);

  if (isPending) {
    return (
      <div className="p-6 bg-muted border-t">
        <div className="flex gap-8">
          <Skeleton className="h-48 w-48 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!detailData) return null;

  const hasImages = detailData.images && detailData.images.length > 0;
  const mainImage = hasImages ? detailData.images![0] : null;
  const subImages = hasImages ? detailData.images!.slice(1, 4) : [];

  return (
    <div className="bg-muted border-t shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
            {mainImage && (
              <div className="space-y-3">
                <div className="relative  w-full overflow-hidden rounded-xl border bg-background shadow-sm">
                  <ImageZoom>
                    <Image
                      src={mainImage.url}
                      alt={
                        detailData.translations?.find(
                          (t) => t.languageCode === "vi"
                        )?.name ||
                        detailData.translations?.[0]?.name ||
                        ""
                      }
                      className="h-full w-full aspect-square object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </ImageZoom>
                </div>
                {subImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {subImages.map((img, idx) => (
                      <div
                        key={idx}
                        className=" rounded-lg overflow-hidden border bg-background cursor-pointer "
                      >
                        <ImageZoom>
                          <Image
                            src={img.url}
                            alt="sub"
                            className="h-full w-full object-cover aspect-square"
                          />
                        </ImageZoom>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* === RIGHT COLUMN: INFORMATION === */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SECTION 1: GENERAL INFO */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-md font-mono text-xs text-muted-foreground px-1.5 py-0 h-5"
                    >
                      {detailData.code}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground  truncate">
                      {detailData.translations?.find(
                        (t) => t.languageCode === "vi"
                      )?.name ||
                        detailData.translations?.[0]?.name ||
                        ""}
                    </h3>
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="w-3.5 h-3.5" />{" "}
                      {detailData.categoryName}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary font-mono tracking-tight">
                    {formatMoney(detailData.price).vndFormatted}
                  </div>
                  <Badge
                    variant={detailData.active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {detailData.active ? "Đang bán" : "Ngừng bán"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Mô tả chi tiết
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
                  {detailData.translations?.find((t) => t.languageCode === "vi")
                    ?.description ||
                    detailData.translations?.[0]?.description ||
                    "Chưa có mô tả cho món ăn này."}
                </p>
              </div>

              {/* Metadata Footer (Timestamps) */}
              <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Ngày tạo:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {detailData.createdAt
                      ? format(
                          new Date(detailData.createdAt),
                          " HH:mm dd/MM/yyyy",
                          { locale: vi }
                        )
                      : "N/A"}
                  </span>
                </div>
                {detailData.updatedAt && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Cập nhật:</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {format(
                          new Date(detailData.updatedAt),
                          " HH:mm dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 2: RECIPE / COMPONENTS */}
            <div className="bg-background rounded-xl border shadow-sm overflow-hidden h-fit">
              <div className="px-4 py-3 border-b bg-muted/10 flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Công thức / Định lượng
                </h4>
                <Badge variant="secondary" className="h-5 text-[10px]">
                  {detailData.components?.length || 0} thành phần
                </Badge>
              </div>

              <ScrollArea className="h-[250px]">
                {detailData.components && detailData.components.length > 0 ? (
                  <div className="divide-y">
                    {detailData.components.map((comp, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 hover:bg-muted/5 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {comp.itemName}
                            </p>
                            {comp.notes ? (
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                "{comp.notes}"
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5 italic">
                                Không có ghi chú
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-foreground bg-muted/30 px-2 py-1 rounded">
                            x{comp.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 gap-2">
                    <Package className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Không có thành phần định lượng</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
