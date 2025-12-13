import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { useAuth } from "~/lib/auth/components";
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
  const { canAccess } = useAuth();

  const filteredNavMain = React.useMemo(() => {
    return SIDEBAR_NAV_MAIN.filter((item) => {
      if (!item.module) return true;
      return canAccess(item.module);
    }).map((item) => {
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
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
