import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { formatMoney } from "~/lib/utils";
import { PenLine, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import type { PosCartItem } from "~/store/pos-order.store";

type CartItemProps = {
  cartItem: PosCartItem;

  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function CartItem({
  cartItem,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const { code, name, imageUrl, unitPrice, quantity } = cartItem;
  const subtotal = unitPrice * quantity;

  return (
    <Card className="shadow-sm p-0">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Image */}
          <div className="flex-shrink-0">
            <Image
              src={imageUrl || "/placeholder-menu.png"}
              alt={name}
              width={100}
              height={100}
              className="h-full rounded-md object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm line-clamp-1">{name}</h4>
                <Badge
                  variant="outline"
                  className="text-xs font-mono flex-shrink-0"
                >
                  {code}
                </Badge>
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
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Counter
                  value={quantity}
                  onChange={(value) => onQuantityChange(value)}
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={onRemove}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
