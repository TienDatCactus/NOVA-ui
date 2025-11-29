import { Sparkles } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";

interface ServiceCardProps {
  service: ServiceItem;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { vndFormatted } = formatMoney(service.basePrice);

  return (
    <Card className="group relative overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 hover:-translate-y-1">
      {/* === 1. VISUAL FRAME (The "Gallery" feel) === */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 shadow-sm ring-1 ring-black/5">
        {service.imageUrls && service.imageUrls.length > 0 ? (
          <Image
            src={service.imageUrls[0]}
            alt={service.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
              !service.active && "grayscale filter" // Mute colors if inactive
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            <Sparkles className="h-10 w-10 text-stone-300" />
          </div>
        )}

        {/* "Service Unavailable" Stamp Effect */}
        {!service.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <div className="rotate-[-12deg] rounded-sm border-2 border-destructive px-4 py-1 text-sm font-bold uppercase tracking-widest text-destructive mix-blend-multiply">
              Tạm ngưng
            </div>
          </div>
        )}

        {/* Soft overlay on hover to add depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* === 2. CONTENT (Editorial Style) === */}
      <CardContent className="px-2 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {/* Serif font gives that "Resort Service Menu" look */}
            <h3 className="font-serif text-lg font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {service.name}
            </h3>

            {/* Sans-serif for readability on small description text */}
            {service.description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80 font-sans">
                {service.description}
              </p>
            )}
          </div>

          {/* Pricing Block */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-base font-semibold text-primary font-serif tracking-wide whitespace-nowrap">
              {vndFormatted}
            </span>
            {service.unitName && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                /{service.unitName}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
