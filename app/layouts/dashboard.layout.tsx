import { DiamondPlus } from "lucide-react";
import React from "react";
import { Link, Outlet, useSearchParams } from "react-router";
import DashboardHeader from "~/components/layouts/headers/header.dashboard";
import DashboardSidebar from "~/components/layouts/side-bar/dashboard/side-bar.dashboard";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarToggleProvider } from "~/context/sidebar.context";
import { CUSTOMER, DASHBOARD } from "~/lib/fe-url";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  return (
    <SidebarToggleProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <DashboardHeader />

            <div
              className={cn(
                "rounded-md p-4 w-full mx-auto bg-background  h-full overflow-auto"
              )}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SidebarToggleProvider>
  );
};

export default DashboardLayout;
