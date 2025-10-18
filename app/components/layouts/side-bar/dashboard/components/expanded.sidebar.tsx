import { Accessibility, ChevronUp, Minimize, User2 } from "lucide-react";
import { Link } from "react-router";
import { Divider } from "~/components/ui/divider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { useAuth } from "~/routes/auth/container/auth.hooks";
import { useAuthStore } from "~/store/auth.store";

function ExpandedSidebar({
  curPath,
  toggle,
}: {
  curPath: string;
  toggle: () => void;
}) {
  const { logout } = useAuth();
  const { user } = useAuthStore();
  console.log(user);
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
                      "shadow-s": curPath.includes(item.href),
                    })}
                    asChild
                    isActive={curPath.includes(item.href)}
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user && (
                  <SidebarMenuButton>
                    <User2 />{" "}
                    <span>
                      {user?.fullName} - {user?.roles?.join(", ")}
                    </span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-40">
                <DropdownMenuItem onClick={logout}>
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default ExpandedSidebar;
