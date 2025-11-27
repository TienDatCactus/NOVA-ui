import { Info, Plus, ShoppingBag, Ban } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Image from "~/components/ui/image";
import { cn, formatMoney } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";

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
  const isDisabled = !active || isOutOfStock;

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border transition-all p-0 duration-200",
        isDisabled
          ? "opacity-60 bg-muted border-transparent" // Disabled State
          : "bg-card border-border/50 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer" // Active State
      )}
      onClick={isDisabled ? undefined : addToOrder}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrls && imageUrls[0] ? (
          <Image
            src={imageUrls[0]}
            alt={name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              !isDisabled && "group-hover:scale-110",
              isOutOfStock && "grayscale" // Visual cue for OOS
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 opacity-20" />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Stock Status */}
          <div>
            {!active && (
              <Badge variant="destructive" className="shadow-sm">
                Ngừng kinh doanh
              </Badge>
            )}
            {isOutOfStock && active && (
              <Badge variant="destructive" className="shadow-sm gap-1">
                <Ban className="h-3 w-3" /> Hết hàng
              </Badge>
            )}
          </div>

          <Badge variant="secondary" className="">
            SL: {maxQuantityAvailable}
          </Badge>
        </div>

        {!isDisabled && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white text-primary rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
              <Plus className="h-6 w-6 stroke-[3]" />
            </div>
          </div>
        )}
      </div>

      {/* === 2. CONTENT AREA === */}
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1">
            <h3
              className={cn(
                "font-bold text-sm leading-tight line-clamp-2",
                !isDisabled && "group-hover:text-primary transition-colors"
              )}
              title={name}
            >
              {name}
            </h3>
            {description && (
              <p className="text-[10px] text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
          </div>

          {/* Info Tooltip (Secondary Action) */}
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px] text-xs">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="pt-1 flex items-baseline justify-between border-t border-dashed mt-2">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-lg font-bold font-mono tracking-tight",
                isDisabled ? "text-muted-foreground" : "text-primary"
              )}
            >
              {formatMoney(price).vndFormatted}
            </span>
            {unitName && (
              <span className="text-[10px] text-muted-foreground">
                /{unitName}
              </span>
            )}
          </div>

          {/* Minimal Code Display */}
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">
            {code}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
