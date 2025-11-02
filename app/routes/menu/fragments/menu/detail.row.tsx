import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageIcon, Package } from "lucide-react";
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
      <div className="p-6 bg-muted/30 border-t">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Không thể tải thông tin chi tiết
      </div>
    );
  }

  const hasImages = detailData.images && detailData.images.length > 0;
  const hasComponents =
    detailData.components && detailData.components.length > 0;

  return (
    <div className="p-6 bg-muted/30 border-t">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Gallery Section */}
        <div className="col-span-1">
          {hasImages ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Hình ảnh ({detailData.images?.length})
              </h4>
              <div className=" grid place-items-center ">
                <Carousel className="w-50">
                  <CarouselContent>
                    {detailData.images?.map((img, index) => (
                      <CarouselItem key={index} className="w-fit">
                        <ImageZoom>
                          <Image
                            src={img.url}
                            height={200}
                            width={200}
                            alt={`${detailData.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </ImageZoom>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md border border-dashed">
              <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
            </div>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Tên món</p>
                <p className="font-medium">{detailData.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Mã món</p>
                <p className="font-mono">{detailData.code}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Danh mục</p>
                <p className="font-medium">{detailData.categoryName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Đơn vị</p>
                <p className="font-medium">{detailData.unitName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Giá bán</p>
                <p className="font-semibold">
                  {formatMoney(detailData.price).vndFormatted}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Trạng thái</p>
                <Badge variant={detailData.active ? "default" : "secondary"}>
                  {detailData.active ? "Hoạt động" : "Ngưng"}
                </Badge>
              </div>
              {/* Timestamps */}
              {(detailData.createdAt || detailData.updatedAt) && (
                <div className="flex flex-col gap-4 text-xs text-muted-foreground">
                  {detailData.createdAt && (
                    <div>
                      <span>Ngày tạo: </span>
                      <span className="font-medium text-foreground">
                        {format(
                          new Date(detailData.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                  {detailData.updatedAt && (
                    <div>
                      <span>Cập nhật: </span>
                      <span className="font-medium text-foreground">
                        {format(
                          new Date(detailData.updatedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Description */}
            {detailData.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </h4>
                <p className="text-sm leading-relaxed text-wrap">
                  {detailData.description}
                </p>
              </div>
            )}

            {/* Components */}
            {hasComponents && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Thành phần ({detailData.components.length})
                </h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {detailData.components.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between p-2.5 bg-background rounded-md border text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{component.itemName}</p>
                        {component.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {component.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-muted-foreground ml-3">
                        x{component.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
