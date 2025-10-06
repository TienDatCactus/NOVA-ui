import { Accessibility, Expand, Minimize, User2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Divider } from "~/components/ui/divider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsMobile } from "~/hooks/use-mobile";
import {
  DASHBOARD_ITEMS_RECEPTIONIST,
  SUB_DASHBOARD_ITEMS,
} from "~/lib/constants";
import { cn } from "~/lib/utils";

type SidebarItem = {
  id: number;
  [key: string]: any;
};
interface SidebarItemListProps {
  mode: "compact" | "expanded";
  setMode: React.Dispatch<React.SetStateAction<"compact" | "expanded">>;
  items: SidebarItem[];
  renderItem: (item: SidebarItem, focused: boolean) => React.ReactNode;
}
function SidebarItemList({
  mode,
  setMode,
  items,
  renderItem,
}: SidebarItemListProps): React.ReactNode {
  const curPath = useLocation().pathname;

  return (
    <ul className={cn("flex  w-fit rounded-full p-2 gap-4 border shadow-s")}>
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

function CompactSidebar({
  mode,
  setMode,
}: {
  mode: "compact" | "expanded";
  setMode: React.Dispatch<React.SetStateAction<"compact" | "expanded">>;
}) {
  return (
    <div
      className={cn(
        "fixed z-20  bottom-4 translate-x-1/2 right-1/2 h-fit  px-4 w-fit "
      )}
    >
      <div className={cn("flex bg-white justify-center h-full shadow-sidebar")}>
        <SidebarItemList
          mode={mode}
          setMode={setMode}
          items={DASHBOARD_ITEMS_RECEPTIONIST}
          renderItem={(item, focused) => (
            <SidebarItem item={item} focused={focused} />
          )}
        />
      </div>
    </div>
  );
}

function ExpandedSidebar({
  curPath,
  setMode,
}: {
  curPath: string;
  setMode: React.Dispatch<React.SetStateAction<"compact" | "expanded">>;
}) {
  return (
    <Sidebar className="h-screen bg-white shadow-s">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex justify-between">
            <SidebarMenuButton>
              <Accessibility /> <h2>NOVA</h2>
            </SidebarMenuButton>
            <SidebarMenuButton
              className="w-fit cursor-pointer"
              onClick={() => setMode("compact")}
            >
              <Minimize />
            </SidebarMenuButton>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <Divider weight="thin" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {DASHBOARD_ITEMS_RECEPTIONIST.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn({
                      "shadow-s": curPath === item.href,
                    })}
                    asChild
                    isActive={curPath === item.href}
                  >
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Divider weight="thin" />
        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SUB_DASHBOARD_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Divider weight="thin" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 /> Username
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export default function DashboardSidebar() {
  const curPath = useLocation().pathname;
  const [mode, setMode] = useState<"compact" | "expanded">("compact");
  return (
    <>
      {mode === "expanded" ? (
        <ExpandedSidebar setMode={setMode} curPath={curPath} />
      ) : (
        <CompactSidebar setMode={setMode} mode={mode} />
      )}
    </>
  );
}
