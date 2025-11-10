import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import { formatMoney } from "~/lib/utils";
import { Plus } from "lucide-react";
import type { ServiceItem } from "~/services/api/services/dto";

type ServiceItemCardProps = {
  serviceItem: ServiceItem;
  addToOrder: () => void;
};

export default function ServiceItemCard({
  addToOrder,
  serviceItem,
}: ServiceItemCardProps) {
  const { active, code, name, description, imageUrls, unitName, basePrice } =
    serviceItem;
  return (
    <Card className="overflow-hidden shadow-sm p-0 hover:shadow-m transition-shadow">
      <div className="relative">
        <Image
          src={imageUrls?.[0] || "/placeholder-service.png"}
          alt={name}
          height={200}
          className="w-full h-full object-cover"
        />
        {!active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Không khả dụng</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-0 px-4 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <data
              value={basePrice}
              className="text-lg font-bold text-primary font-mono"
            >
              {formatMoney(basePrice).vndFormatted}
            </data>
            {unitName && (
              <span className="text-xs text-muted-foreground ml-1">
                /{unitName}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {code}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={addToOrder}
          disabled={!active}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Thêm vào giỏ
        </Button>
      </CardFooter>
    </Card>
  );
}
