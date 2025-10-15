import { DASHBOARD_ITEMS_RECEPTIONIST } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { SidebarItem, SidebarItemList } from "../fragments/sidebar-item";

function CompactSidebar() {
  return (
    <div
      className={cn(
        "fixed z-20 bottom-4 translate-x-1/2 right-1/2 h-fit  px-4 w-fit "
      )}
    >
      <div className={cn("flex justify-center h-full shadow-sidebar")}>
        <SidebarItemList
          items={DASHBOARD_ITEMS_RECEPTIONIST}
          renderItem={(item, focused) => (
            <SidebarItem item={item} focused={focused} />
          )}
        />
      </div>
    </div>
  );
}
export default CompactSidebar;
