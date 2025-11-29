import { ChevronRight, type LucideIcon, Circle } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();

  const isRouteActive = (url: string, exact = false) => {
    return exact ? pathname === url : pathname.startsWith(url);
  };

  return (
    <SidebarGroup className="">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">
        Quản lý hệ thống
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isChildActive = item.items?.some((sub) =>
            isRouteActive(sub.url)
          );
          const isParentActive = isRouteActive(item.url);

          return (
            <React.Fragment key={item.title}>
              {!!item.items && item.items.length > 0 ? (
                <Collapsible
                  asChild
                  defaultOpen={isChildActive || isParentActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isChildActive}
                        className={cn(
                          "transition-colors duration-200 font-medium",
                          isChildActive && "text-primary font-semibold"
                        )}
                      >
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = isRouteActive(subItem.url, true);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className={cn(
                                  "transition-all duration-200",
                                  isSubActive
                                    ? "bg-primary/10 text-primary font-medium translate-x-1"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <Link to={subItem.url}>
                                  <Circle
                                    className={cn(
                                      "w-4 h-4 mr-1 scale-0 transition-transform",
                                      isSubActive && "scale-100 fill-current"
                                    )}
                                  />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.url)}
                    className={cn(
                      "transition-all duration-200",
                      isRouteActive(item.url) &&
                        "bg-primary/10 text-primary font-semibold"
                    )}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
