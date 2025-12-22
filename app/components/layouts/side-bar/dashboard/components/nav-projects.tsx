import { type LucideIcon } from "lucide-react";
import { useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { pathname } = useLocation();
  const isRouteActive = (url: string, exact = false) => {
    return exact ? pathname === url : pathname.startsWith(url);
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {projects.length > 0 && (
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">
          Cài đặt hệ thống
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton isActive={isRouteActive(item.url)} asChild>
              <a
                className={cn(isRouteActive(item.url) && "font-semibold")}
                href={item.url}
              >
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
