import { Accessibility, Minimize, User2 } from "lucide-react";
import { Link } from "react-router";
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
  DASHBOARD_ITEMS_RECEPTIONIST,
  SUB_DASHBOARD_ITEMS,
} from "~/lib/constants";
import { cn } from "~/lib/utils";

function ExpandedSidebar({
  curPath,
  toggle,
}: {
  curPath: string;
  toggle: () => void;
}) {
  return (
    <Sidebar className="h-screen bg-background shadow-s">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex justify-between">
            <SidebarMenuButton>
              <Accessibility /> <h2>NOVA</h2>
            </SidebarMenuButton>
            <SidebarMenuButton
              className="w-fit cursor-pointer"
              onClick={toggle}
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

export default ExpandedSidebar;
