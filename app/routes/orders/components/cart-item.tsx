import { AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
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
  const { code, name, unitPrice, quantity, maxQuantityAvailable } = cartItem;

  const subtotal = unitPrice * quantity;

  return (
    <Card
      className={cn(
        "group relative flex gap-3 rounded-xl border p-2 ",
        // Valid State
        !isInvalid &&
          "bg-card border-border hover:border-primary/50 hover:shadow-sm",
        // Invalid State (e.g. Out of stock during session)
        isInvalid &&
          "bg-destructive/5 border-destructive/50 border-dashed hover:bg-destructive/10"
      )}
    >
      {/* 2. CONTENT AREA */}
      <CardContent className="grid gap-2 p-2">
        <div className="space-y-2">
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
          </div>{" "}
          <div className="shrink-0">
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
        <div className="flex justify-between gap-2 mt-2">
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
              className="w-28"
            />

            <Button variant="destructive" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
