import { Check, ShoppingCart } from "lucide-react";
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
 * Shows menu item image, name, description, price, and selection toggle
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
        "p-2.5 border h-fit cursor-pointer hover:shadow-md transition-all",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onToggle}
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="h-20 bg-muted rounded-md overflow-hidden flex items-center justify-center">
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
          <p className="font-medium line-clamp-1 text-sm">{menuItem.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {menuItem.description}
          </p>
          <p className="text-sm font-semibold text-primary mt-1">
            {menuItem.price
              ? formatMoney(menuItem.price).vndFormatted
              : "Liên hệ"}
          </p>
        </div>
      </div>
      <CardFooter className="flex justify-end p-0 pt-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full h-8"
        >
          {isSelected ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Đã chọn
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Thêm vào
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
