import { Trash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { Counter } from "~/components/ui/shadcn-io/counter";

type ServiceItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  quantity?: number;
};
interface ServiceItemProps {
  item: ServiceItem;
}
function ServiceItemList({ item }: ServiceItemProps) {
  return (
    <li className="flex items-center justify-between bg-background p-2 border rounded-md my-2">
      <div>
        <h3>{item.name}</h3>
        <p className="text-muted-foreground text-sm"> ${item.price} x (1)</p>
      </div>
      <div>
        <Counter number={item.quantity ?? 1} setNumber={() => {}} />
      </div>
      <div>
        <Button variant={"destructive"}>
          <Trash />
          Xóa
        </Button>
      </div>
    </li>
  );
}
function ServiceItemGrid({ item }: ServiceItemProps) {
  return (
    <li className="flex flex-col items-start gap-2 justify-between bg-background p-2 border rounded-md  cursor-pointer hover:shadow-md ">
      <Image
        src={
          item?.imageUrl ??
          "https://via.placeholder.com/168x100.png?text=No+Image"
        }
        alt=""
        className="w-full"
        width={168}
        height={100}
      />
      <h1>{item?.name}</h1>
      <div className="flex items-center justify-between w-full">
        <Badge>{item?.category ?? "dat"}</Badge>
        <data value={item?.price}>{item?.price}</data>
      </div>
    </li>
  );
}
export { ServiceItemList, ServiceItemGrid };
