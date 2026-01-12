import { UtensilsCrossed } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";

interface MenuCardProps {
  item: MenuListItemDto;
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 p-0 shadow-sm transition-all duration-500",
        "hover:bg-background/80 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-1"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-xl bg-card/50 shadow-inner ring-1 ring-foreground/5">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <img
            src={item.imageUrls[0]}
            alt={
              item.translations?.find((t) => t.languageCode === "vi")?.name ||
              item.translations?.[0]?.name ||
              ""
            }
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
              !item.active && "grayscale filter opacity-80" // Desaturate unavailable items
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* "Sold Out" Mist Overlay */}
        {!item.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100/60 backdrop-blur-[2px] z-10">
            <div className="rotate-[-12deg] rounded-lg border-2 border-stone-500 px-4 py-1 text-sm font-bold uppercase tracking-widest text-stone-600 mix-blend-multiply bg-background/50 shadow-sm">
              Hết món
            </div>
          </div>
        )}

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* === 2. CONTENT === */}
      <CardContent className="px-4 pb-4 pt-1">
        <div className="flex flex-col gap-2">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
              {item.translations?.find((t) => t.languageCode === "vi")?.name ||
                item.translations?.[0]?.name ||
                ""}
            </h3>

            {/* Price Tag */}
          </div>

          {/* Description */}
          {item.translations?.find((t) => t.languageCode === "vi")
            ?.description || item.translations?.[0]?.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-sans">
              {item.translations?.find((t) => t.languageCode === "vi")
                ?.description || item.translations?.[0]?.description}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
