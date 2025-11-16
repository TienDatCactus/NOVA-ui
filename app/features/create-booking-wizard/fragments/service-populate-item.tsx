import Image from "~/components/ui/image";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";

function ServicePopulateItem({
  id,
  quantity,
  note,
  itemType,
}: {
  id: string;
  quantity: number;
  note?: string;
  itemType: "ServiceItem" | "MenuItem";
}) {
  const { data: serviceItem } = useServiceDetail(id, {
    enabled: itemType === "ServiceItem",
  });
  const { data: menuItem } = useMenuItemDetail(id, {
    enabled: itemType === "MenuItem",
  });
  let data = serviceItem || menuItem;
  console.log(data);
  return (
    <div key={id} className="grid gap-2 text-sm">
      <span className="flex gap-2 items-center">
        <Image
          src={data?.images?.[0]?.url || ""}
          alt={data?.name}
          className="h-10 w-10"
        />
        <p className=" text-muted-foreground">{data?.name}</p>
        <sup>x {quantity}</sup>
      </span>
    </div>
  );
}

export default ServicePopulateItem;
