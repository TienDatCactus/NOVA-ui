import { Trash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { Counter } from "~/components/ui/shadcn-io/counter";
import { useServiceContext } from "../local-context/service-modal.context";
import { cn } from "~/lib/utils";

interface ServiceItemProps {
  item: any;
}

function ServiceItemList({ item }: ServiceItemProps) {
  const { updateQuantity, removeService, getQuantity } = useServiceContext();
  const quantity = getQuantity(item.id);

  return (
    <li className="flex items-center justify-between bg-background p-2 border rounded-md my-2">
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-muted-foreground text-sm">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.price)}{" "}
          x ({quantity})
        </p>
      </div>
      <div className="flex-shrink-0 mx-2">
        <Counter
          number={quantity}
          setNumber={updateQuantity}
          itemId={item.id}
          min={1}
          max={99}
        />
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => removeService(item.id)}
        >
          <Trash className="w-4 h-4 mr-1" />
          Xóa
        </Button>
      </div>
    </li>
  );
}

function ServiceItemGrid({ item }: ServiceItemProps) {
  const { addService, isInCart, getQuantity } = useServiceContext();
  const inCart = isInCart(item.id);
  const quantity = getQuantity(item.id);

  return (
    <li
      className={cn(
        "flex flex-col items-start gap-2 justify-between bg-background p-2 border rounded-md cursor-pointer hover:shadow-md transition-all",
        {
          "ring-2 ring-primary": inCart,
        }
      )}
      onClick={() => addService({ ...item, quantity: 1 })}
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
      <p className="text-xs text-muted-foreground truncate line-clamp-1">
        {item.description}
      </p>
      <div className="flex items-center justify-between w-full">
        <Badge variant="outline">{item?.category}</Badge>
        <span className="font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.price)}
        </span>
      </div>
    </li>
  );
}

export { ServiceItemList, ServiceItemGrid };
