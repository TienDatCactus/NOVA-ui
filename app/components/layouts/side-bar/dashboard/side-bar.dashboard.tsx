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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

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
    navMain: SIDEBAR_NAV_MAIN,
    projects: SIDEBAR_PROJECTS,
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
