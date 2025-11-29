import { UtensilsCrossed } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { cn, formatMoney } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";

interface MenuCardProps {
  item: MenuListItemDto;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { vndFormatted } = formatMoney(item.price);

  return (
    <Card className="group relative overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 hover:-translate-y-1">
      {/* === 1. VISUAL FRAME (The "Polaroid" or "Window" feel) === */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 shadow-sm ring-1 ring-black/5">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <img
            src={item.imageUrls[0]}
            alt={item.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
              !item.active && "grayscale filter" // Old school visual cue for unavailable
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            <UtensilsCrossed className="h-10 w-10 text-stone-300" />
          </div>
        )}

        {/* "Sold Out" Stamp effect instead of generic badge */}
        {!item.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-sm border-2 border-destructive px-4 py-1 text-sm font-bold uppercase tracking-widest text-destructive mix-blend-multiply">
              Hết món
            </div>
          </div>
        )}

        {/* Overlay gradient for better text contrast if needed inside image (Optional) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* === 2. CONTENT (Editorial Style) === */}
      <CardContent className="px-2 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {/* Typography: Serif font creates the "Old School" resort vibe */}
            <h3 className="font-serif text-lg font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </h3>

            {/* Description: Cleaner, lighter weight */}
            {item.description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80 font-sans">
                {item.description}
              </p>
            )}
          </div>

          {/* Price: Monospace or Serif for numbers works well */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-base font-semibold text-primary font-serif tracking-wide whitespace-nowrap">
              {vndFormatted}
            </span>
            {item.unitName && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                /{item.unitName}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
