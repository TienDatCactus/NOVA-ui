import { ScrollArea } from "~/components/ui/scroll-area";
import { TabsContent } from "~/components/ui/tabs";
import { ServiceItemGrid } from "../fragments/service-item";
import useServices from "../container/useServices";

function ServiceTab() {
  const { data, isPending } = useServices();
  if (isPending) {
    return <div>Loading...</div>;
  }
  console.log(data);
  return (
    <TabsContent key={"service"} value={"Service"}>
      <ScrollArea className="h-120 bg-white border rounded-md">
        <ul className="grid p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((serviceItem) =>
            serviceItem.items.map((item) => (
              <ServiceItemGrid key={item.serviceItemId} item={item} />
            ))
          )}
        </ul>
      </ScrollArea>
    </TabsContent>
  );
}

export default ServiceTab;
