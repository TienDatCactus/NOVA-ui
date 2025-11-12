import { Check, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardFooter } from "~/components/ui/card";
import Image from "~/components/ui/image";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";

interface ServiceCardProps {
  service: ServiceItem;
  isSelected: boolean;
  quantity?: number;
  onToggle: () => void;
  onQuantityChange?: (quantity: number) => void;
}

/**
 * Service card component for order dialog
 * Shows service image, name, description, price, and selection toggle
 */
export default function ServiceCard({
  service,
  isSelected,
  quantity = 0,
  onToggle,
  onQuantityChange,
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "p-2.5 border h-fit cursor-pointer hover:shadow-md transition-all",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onToggle}
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="h-20 bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {service.imageUrls && service.imageUrls.length > 0 ? (
            <Image
              src={service.imageUrls[0]}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Không có ảnh</span>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="font-medium line-clamp-1 text-sm">{service.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {service.description}
          </p>
          <p className="text-sm font-semibold text-primary mt-1">
            {service.basePrice
              ? formatMoney(service.basePrice).vndFormatted
              : "Liên hệ"}
          </p>
        </div>
      </div>
      <CardFooter className="flex justify-end p-0 pt-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full h-8"
        >
          {isSelected ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Đã chọn
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Thêm vào
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
