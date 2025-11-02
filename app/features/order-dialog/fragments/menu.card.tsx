import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardFooter } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { cn, formatMoney } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";

interface MenuCardProps {
  menuItem: MenuListItemDto;
  isSelected: boolean;
  quantity?: number;
  onToggle: () => void;
  onQuantityChange?: (quantity: number) => void;
}

/**
 * Menu card component for order dialog
 * Shows menu item image, name, description, price, and quantity controls
 */
export default function MenuCard({
  menuItem,
  isSelected,
  quantity = 0,
  onToggle,
  onQuantityChange,
}: MenuCardProps) {
  return (
    <Card
      className={cn(
        "p-3 border h-fit cursor-pointer hover:shadow-md transition-all",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="h-28 bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
            <Image
              src={menuItem.imageUrls[0]}
              alt={menuItem.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Không có ảnh</span>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="font-medium line-clamp-1">{menuItem.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {menuItem.description}
          </p>
          <p className="text-sm font-semibold text-primary mt-1">
            {menuItem.price
              ? formatMoney(menuItem.price).vndFormatted
              : "Liên hệ"}
          </p>
        </div>
      </div>
      <CardFooter className="flex justify-end p-0 pt-2 gap-2">
        {isSelected && quantity > 0 ? (
          <>
            <div className="flex items-center gap-2 flex-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  const newQty = Math.max(1, quantity - 1);
                  onQuantityChange?.(newQty);
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-8 text-center font-medium">
                {quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange?.(quantity + 1);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={onToggle}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              Xóa
            </Button>
          </>
        ) : (
          <Button onClick={onToggle} variant="outline" className="w-full">
            Thêm vào Order
            <ShoppingCart />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
