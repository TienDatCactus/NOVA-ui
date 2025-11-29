// components/fragments/universal-product-card.tsx

import { Check, Image as ImageIcon, Plus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { cn, formatMoney } from "~/lib/utils";
import type { UnifiedProduct } from "..";

interface UniversalProductCardProps {
  product: UnifiedProduct;
  quantity: number; // Số lượng đã chọn trong giỏ (0 nếu chưa chọn)
  onToggle: () => void;
}

export default function UniversalProductCard({
  product,
  quantity,
  onToggle,
}: UniversalProductCardProps) {
  const isSelected = quantity > 0;

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden border transition-all hover:shadow-md cursor-pointer h-full p-0",
        isSelected
          ? "border-primary ring-1 ring-primary bg-primary/5"
          : "bg-card"
      )}
      onClick={onToggle}
    >
      {/* 1. Image Area & Status Badge */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}

        {/* Quantity Badge (Overlay) - UX: Biết ngay mình đã chọn bao nhiêu */}
        {quantity > 0 && (
          <div className="absolute right-2 top-2 z-10">
            <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-sm animate-in zoom-in-50">
              {quantity}
            </Badge>
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
            {product.description || "Chưa có mô tả chi tiết"}
          </p>
        </div>

        {/* 3. Footer: Price & Action */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            {product.code && (
              <span className="text-[10px] text-muted-foreground uppercase font-mono">
                {product.code}
              </span>
            )}
            <span className="text-sm font-bold text-primary">
              {formatMoney(product.price).vndFormatted}
            </span>
          </div>

          <Button
            size="icon"
            variant={isSelected ? "default" : "secondary"}
            className={cn(
              "h-8 w-8 shrink-0 rounded-full transition-colors shadow-sm",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
            )}
          >
            {isSelected ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
