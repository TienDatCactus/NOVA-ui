import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { useAuthStore } from "~/store/auth.store";
import {
  SIDEBAR_NAV_MAIN,
  SIDEBAR_PROJECTS,
  SIDEBAR_TEAMS,
} from "~/lib/constants";
import { NavMain } from "./components/nav-main";
import { NavProjects } from "./components/nav-projects";
import { NavUser } from "./components/nav-user";
import { TeamSwitcher } from "./components/switcher";
import { useAuth } from "~/lib/auth/components";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const { canAccess } = useAuth();

  // Filter navigation items based on user permissions
  const filteredNavMain = React.useMemo(() => {
    return SIDEBAR_NAV_MAIN.filter((item) => {
      // If no module specified, show item
      if (!item.module) return true;
      // Check if user can access the module
      return canAccess(item.module);
    }).map((item) => {
      // Filter sub-items if they exist
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((subItem) => {
            if (!subItem.module) return true;
            return canAccess(subItem.module);
          }),
        };
      }
      return item;
    });
  }, [canAccess]);

  const filteredProjects = React.useMemo(() => {
    return SIDEBAR_PROJECTS.filter((project) => {
      if (!project.module) return true;
      return canAccess(project.module);
    });
  }, [canAccess]);

  const data = {
    user: user
      ? {
          name: user.fullName || user.userName || "User",
          email: user.userName || "",
          avatar: "/avatars/default.jpg",
        }
      : {
          name: "Guest",
          email: "",
          avatar: "/avatars/default.jpg",
        },
    teams: SIDEBAR_TEAMS,
    navMain: filteredNavMain,
    projects: filteredProjects,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
