import { Package, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

interface ItemCardProps {
  item: StockItemsListItemDto;
  onClick?: () => void;
  className?: string;
}

/**
 * Component hiển thị thông tin item dạng card
 */
export default function ItemCard({ item, onClick, className }: ItemCardProps) {
  const isOverStock = (item?.currentStock ?? 0) > (item?.maxStock ?? 0);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        !item.isActive && "opacity-50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{item.name}</CardTitle>
          </div>
          {!item.isActive && (
            <Badge variant="secondary" className="text-xs">
              Ngừng hoạt động
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{item.code}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stock status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tồn kho:</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-lg font-semibold",
                isOverStock && "text-orange-500"
              )}
            >
              {item.currentStock}
            </span>
            <span className="text-sm text-muted-foreground">
              {item.unitCode}
            </span>

            {isOverStock && <TrendingUp className="h-4 w-4 text-orange-500" />}
          </div>
        </div>

        {/* Min/Max stock */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Min: {item.minStock}</span>
          <span>Max: {item.maxStock}</span>
        </div>

        {/* Average cost */}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-sm text-muted-foreground">Giá TB:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item?.averageCost ?? 0)}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Danh mục:</span>
          <Badge variant="outline" className="text-xs">
            {item.categoryName}
          </Badge>
        </div>

        {/* Low stock warning */}
      </CardContent>
    </Card>
  );
}
