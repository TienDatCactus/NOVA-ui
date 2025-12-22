import { Sparkles } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { cn } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";

interface ServiceCardProps {
  service: ServiceItem;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "group relative p-0 overflow-hidden border-0 shadow-sm transition-all duration-500",
        "hover:bg-background/80  hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-1"
      )}
    >
      {/* === 1. VISUAL FRAME === */}
      <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-xl bg-stone-200/50 shadow-inner ring-1 ring-black/5">
        {service.imageUrls && service.imageUrls.length > 0 ? (
          <Image
            src={service.imageUrls[0]}
            alt={service.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
              !service.active && "grayscale filter opacity-80" // Desaturate if inactive
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* "Temporarily Suspended" Mist Overlay */}
        {!service.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100/60 backdrop-blur-[2px] z-10">
            <div className="rotate-[-12deg] rounded-lg border-2 border-muted-foreground px-4 py-1 text-sm font-bold uppercase tracking-widest text-muted-foreground mix-blend-multiply bg-background/50 shadow-sm">
              Tạm ngưng
            </div>
          </div>
        )}

        {/* Soft gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* === 2. CONTENT === */}
      <CardContent className="px-4 pb-4 pt-1">
        <div className="flex flex-col gap-2">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-lg font-bold leading-tight text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
              {service.name}
            </h3>
          </div>

          {/* Description */}
          {service.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-sans">
              {service.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
