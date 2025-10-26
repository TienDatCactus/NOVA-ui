import { Trash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { useServiceContext } from "../local-context/service-modal.context";
import { cn, formatMoney } from "~/lib/utils";
import type z from "zod";
import useServiceSchema from "~/services/schema/service.schema";

const { ServiceItem2Schema } = useServiceSchema();
type ServiceItem = z.infer<typeof ServiceItem2Schema> & {
  quantity?: number;
  imageUrl?: string;
  category?: string;
};

interface ServiceItemListProps {
  item: ServiceItem;
}

function ServiceItemList({ item }: ServiceItemListProps) {
  const { updateQuantity, removeService, getQuantity } = useServiceContext();
  const quantity = getQuantity(item.serviceItemId);

  return (
    <li className="flex items-center justify-between bg-background p-2 border rounded-md my-2">
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-muted-foreground text-sm">
          {formatMoney(item.basePrice).vndFormatted} x ({quantity})
        </p>
      </div>
      <div className="flex-shrink-0 mx-2"></div>
      <div className="flex-shrink-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeService(item.serviceItemId)}
        >
          <Trash className="w-4 h-4 mr-1" />
          Xóa
        </Button>
      </div>
    </li>
  );
}

interface ServiceItemGridProps {
  item: ServiceItem;
}

function ServiceItemGrid({ item }: ServiceItemGridProps) {
  const { addService, isInCart, getQuantity } = useServiceContext();
  const inCart = isInCart(item.serviceItemId);
  const quantity = getQuantity(item.serviceItemId);

  const handleAddToCart = () => {
    // Ensure we add it with the service type designation
    const serviceItem = {
      ...item,
      quantity: 1, // Ensure quantity is set
    };
    addService(serviceItem);
  };

  return (
    <li
      className={cn(
        "flex flex-col items-start gap-2 justify-between bg-background p-2 border rounded-md cursor-pointer hover:shadow-md transition-all",
        {
          "ring-2 ring-primary": inCart,
        }
      )}
      onClick={handleAddToCart}
    >
      <div className="relative w-full">
        <Image
          src={
            item?.imageUrl ??
            "https://via.placeholder.com/168x100.png?text=No+Image"
          }
          alt={item.name}
          className="w-full rounded-sm"
          width={216}
          height={100}
        />
        {inCart && (
          <Badge className="absolute top-1 right-1 bg-primary">
            {quantity}
          </Badge>
        )}
      </div>
      <h3 className="font-medium">{item.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {item.description}
      </p>
      <div className="flex items-center justify-between w-full">
        <Badge variant="outline">{item?.category || item?.code}</Badge>
        <span className="font-semibold">
          {formatMoney(item.basePrice).vndFormatted}
        </span>
      </div>
    </li>
  );
}

export { ServiceItemList, ServiceItemGrid };
