import { Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { formatMoney } from "~/lib/utils";
import type { MenuPosCartItem } from "~/store/menu-pos-order.store";
import type { ServicePosCartItem } from "~/store/service-pos-order.store";
import { toast } from "sonner";

type CartItemProps = {
  cartItem: MenuPosCartItem | ServicePosCartItem;

  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function CartItem({
  cartItem,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const { code, name, unitPrice, quantity, maxQuantityAvailable } =
    cartItem as MenuPosCartItem;
  const subtotal = unitPrice * quantity;

  return (
    <Card className="shadow-none p-0 border-none snap-center">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
                <div className="flex gap-1 items-center flex-shrink-0">
                  {maxQuantityAvailable !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      Tối đa: {maxQuantityAvailable}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-mono">
                    {code}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <data
                value={subtotal}
                className="font-bold text-sm text-primary font-mono"
              >
                {formatMoney(subtotal).vndFormatted}
              </data>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Counter
                value={quantity}
                onChange={(value) => {
                  // Validate before changing
                  if (
                    maxQuantityAvailable !== undefined &&
                    value > maxQuantityAvailable
                  ) {
                    toast.error(`Số lượng tối đa: ${maxQuantityAvailable}`);
                    return;
                  }
                  onQuantityChange(value);
                }}
                className="w-40"
              />
              <div className="flex gap-1">
                <Button
                  variant="destructive-ghost"
                  size="icon"
                  onClick={onRemove}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
