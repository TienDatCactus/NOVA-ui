import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { useMenuItemDetail } from "../container/menu-query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { ImageIcon, Package, DollarSign, Info, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "~/components/ui/image";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";

interface MenuDetailRowProps {
  menuItem: MenuListItemDto;
}

export default function MenuDetailRow({ menuItem }: MenuDetailRowProps) {
  const { data: detailData, isPending } = useMenuItemDetail(menuItem.itemId);

  if (isPending) {
    return (
      <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 border-l-4 border-l-primary/30 animate-in slide-in-from-top-2 duration-200">
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

  const hasImages = detailData.imageUrls && detailData.imageUrls.length > 0;
  const hasComponents =
    detailData.components && detailData.components.length > 0;

  return (
    <div className="p-6 bg-gradient-to-br from-primary/5 via-background to-muted/20 border-l-4 border-l-primary/40 animate-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Gallery Section */}
        <div className="col-span-1">
          {hasImages ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ImageIcon className="w-4 h-4" />
                <span>Hình ảnh ({detailData.imageUrls.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {detailData.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden border-2 border-border/50 shadow-md hover:shadow-lg transition-all duration-300 group aspect-square"
                  >
                    <ImageZoom>
                      <Image
                        src={url}
                        height={200}
                        width={200}
                        alt={`${detailData.name} - ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </ImageZoom>
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}/{detailData.imageUrls.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-border">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {/* Basic Info Card */}
          <Card className="p-4 shadow-sm border-l-4 border-l-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-base">Thông tin cơ bản</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tên món</p>
                <p className="font-semibold">{detailData.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mã món</p>
                <p className="font-mono text-sm">{detailData.code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Danh mục</p>
                <Badge variant="outline">{detailData.categoryName}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Đơn vị</p>
                <Badge variant="secondary">{detailData.unitName}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Giá bán</p>
                <p className="font-bold text-primary text-lg">
                  {formatMoney(detailData.price).vndFormatted}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
                <Badge variant={detailData.active ? "success" : "secondary"}>
                  {detailData.active ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Description Card */}
          {detailData.description && (
            <Card className="p-4 shadow-sm border-l-4 border-l-blue-400/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-base">Mô tả</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detailData.description}
              </p>
            </Card>
          )}

          {/* Components Card */}
          {hasComponents && (
            <Card className="p-4 shadow-sm border-l-4 border-l-amber-400/30">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-base">
                  Thành phần ({detailData.components.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {detailData.components.map((component) => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {component.itemName}
                      </p>
                      {component.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {component.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-3">
                      x{component.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timestamps Card */}
          {(detailData.createdAt || detailData.updatedAt) && (
            <Card className="p-4 shadow-sm border-l-4 border-l-green-400/30">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-base">Thời gian</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {detailData.createdAt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Ngày tạo
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(detailData.createdAt),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                )}
                {detailData.updatedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Cập nhật lần cuối
                    </p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(detailData.updatedAt),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
