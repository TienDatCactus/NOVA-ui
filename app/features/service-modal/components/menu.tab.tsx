import { TabsContent } from "@radix-ui/react-tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import useMenu from "../container/useMenu";
import { MenuItemGrid } from "../fragments/menu-item";

function MenuTab() {
  const { data, isPending } = useMenu();
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (!!data && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Không tìm thấy món ăn nào</p>
      </div>
    );
  }
  return (
    <TabsContent value="Menu" key={"menu"}>
      <ScrollArea className="h-120 bg-white border rounded-md">
        <ul className="grid p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((menuItem) =>
            menuItem.items.map((item) => (
              <MenuItemGrid key={item.itemId} item={item} />
            ))
          )}
        </ul>
      </ScrollArea>
    </TabsContent>
  );
}

export default MenuTab;
