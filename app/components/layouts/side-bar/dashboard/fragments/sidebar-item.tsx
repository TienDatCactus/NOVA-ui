import { Expand } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useSidebarContext } from "~/context/sidebar.context";
import { cn } from "~/lib/utils";
export type SidebarItem = {
  id: number;
  [key: string]: any;
};
interface SidebarItemListProps {
  items: SidebarItem[];
  renderItem: (item: SidebarItem, focused: boolean) => React.ReactNode;
}

function SidebarItem({
  item,
  focused,
}: {
  item: SidebarItem;
  focused: boolean;
}) {
  return (
    <Link
      className={cn(
        "p-2 grid place-items-center rounded-full  w-fit hover:scale-105 hover:-translate-y-1 transition-transform ",
        {
          "bg-primary text-primary-foreground hover:bg-accent-foreground":
            focused,
          "hover:bg-accent": !focused,
        }
      )}
      to={item.href}
    >
      <Tooltip>
        <TooltipTrigger>{item.icon}</TooltipTrigger>
        <TooltipContent sideOffset={6} side="top">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}

function SidebarItemList({
  items,
  renderItem,
}: SidebarItemListProps): React.ReactNode {
  const curPath = useLocation().pathname;
  const { setMode } = useSidebarContext();
  return (
    <ul
      className={cn(
        "flex bg-background w-fit rounded-full p-2 gap-4 border shadow-sm"
      )}
    >
      {items.map((item) => (
        <li key={item.id}>{renderItem(item, item.href == curPath)}</li>
      ))}
      <li>
        <div
          onClick={() => {
            setMode("expanded");
          }}
          className="p-2 grid place-items-center rounded-full w-fit hover:scale-105 hover:-translate-y-1 transition-transform"
        >
          <Tooltip>
            <TooltipTrigger>
              <Expand />
            </TooltipTrigger>
            <TooltipContent sideOffset={6} side="top">
              <p>EXPAND</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </li>
    </ul>
  );
}

export { SidebarItemList, SidebarItem };
