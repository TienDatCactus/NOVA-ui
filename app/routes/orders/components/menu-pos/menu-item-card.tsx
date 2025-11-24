import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import { formatMoney } from "~/lib/utils";
import { Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type {
  MenuItemDetailDto,
  MenuListItemDto,
} from "~/services/api/menu/dto";

type MenuItemCardProps = {
  menuItem: MenuListItemDto;
  addToOrder: () => void;
};

export default function MenuItemCard({
  addToOrder,
  menuItem,
}: MenuItemCardProps) {
  const {
    active,
    code,
    name,
    description,
    imageUrls,
    unitName,
    price,
    maxQuantityAvailable,
  } = menuItem;

  const isOutOfStock = maxQuantityAvailable === 0;
  const isLowStock = maxQuantityAvailable > 0 && maxQuantityAvailable <= 5;

  return (
    <Card className="overflow-hidden shadow-sm p-0 hover:shadow-m transition-shadow">
      <div className="relative ">
        <Image
          src={imageUrls[0] || "/placeholder-menu.png"}
          alt={name}
          height={200}
          className="w-full h-full object-cover"
        />
        {!active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Không khả dụng</Badge>
          </div>
        )}
        {isOutOfStock && active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Hết hàng</Badge>
          </div>
        )}
        {isLowStock && !isOutOfStock && active && (
          <Badge variant="warning" className="absolute top-2 right-2">
            Còn {maxQuantityAvailable}
          </Badge>
        )}
      </div>

      <CardContent className="p-0 px-4 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <data
              value={price}
              className="text-lg font-bold text-primary font-mono"
            >
              {formatMoney(price).vndFormatted}
            </data>
            {unitName && (
              <span className="text-xs text-muted-foreground ml-1">
                /{unitName}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {code}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={addToOrder}
          disabled={!active || isOutOfStock}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>
      </CardFooter>
    </Card>
  );
}
