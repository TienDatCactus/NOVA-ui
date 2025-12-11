import { AlertCircle, ImageOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn, formatMoney } from "~/lib/utils";
import type { MenuPosCartItem } from "~/store/menu-pos-order.store";

type CartItemProps = {
  cartItem: MenuPosCartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  isInvalid?: boolean;
};

export default function CartItem({
  cartItem,
  onQuantityChange,
  onRemove,
  isInvalid,
}: CartItemProps) {
  const { code, name, unitPrice, quantity, maxQuantityAvailable, imageUrl } =
    cartItem;

  const subtotal = unitPrice * quantity;

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl border p-2 transition-all duration-200",
        // Valid State
        !isInvalid &&
          "bg-card border-border hover:border-primary/50 hover:shadow-sm",
        // Invalid State (e.g. Out of stock during session)
        isInvalid &&
          "bg-destructive/5 border-destructive/50 border-dashed hover:bg-destructive/10"
      )}
    >
      {/* 1. THUMBNAIL AREA */}
      <div className="shrink-0">
        <div
          className={cn(
            "h-full w-20 overflow-hidden rounded-lg border bg-muted flex items-center justify-center",
            isInvalid && "opacity-50 grayscale"
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              className="h-full w-full aspect-square object-cover"
            />
          ) : (
            <ImageOff className="h-6 w-6 text-muted-foreground/30" />
          )}
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
        {/* Top Row: Name & Price */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5 min-w-0">
            <h4
              className={cn(
                "font-semibold text-sm leading-tight truncate pr-2",
                isInvalid ? "text-destructive" : "text-foreground"
              )}
              title={name}
            >
              {name}
            </h4>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-4 px-1 text-[0.625rem] font-mono text-muted-foreground border-border/50"
              >
                {code}
              </Badge>
              {/* Unit Price Hint */}
              <span className="text-[0.625rem] text-muted-foreground">
                x {formatMoney(unitPrice).vndFormatted}
              </span>
            </div>
          </div>

          {/* Subtotal Display */}
          <div className="text-right shrink-0">
            <data
              value={subtotal}
              className={cn(
                "font-bold text-sm font-mono block",
                isInvalid ? "text-destructive/70" : "text-primary"
              )}
            >
              {formatMoney(subtotal).vndFormatted}
            </data>
          </div>
        </div>

        {/* Bottom Row: Controls */}
        <div className="flex items-end justify-between gap-2 mt-2">
          {/* Invalid Indicator */}
          {isInvalid ? (
            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Không khả dụng</span>
            </div>
          ) : (
            <div /> /* Spacer */
          )}

          <div className="flex items-center gap-1">
            <Counter
              value={quantity}
              minValue={1}
              maxValue={maxQuantityAvailable}
              onChange={(value) => {
                if (
                  maxQuantityAvailable !== undefined &&
                  value > maxQuantityAvailable
                ) {
                  toast.error(`Chỉ còn ${maxQuantityAvailable} món`);
                  return;
                }
                onQuantityChange(value);
              }}
              className="h-8 w-28"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Xóa món</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
