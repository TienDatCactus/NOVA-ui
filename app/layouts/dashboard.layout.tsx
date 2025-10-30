import React from "react";
import { Outlet, useSearchParams } from "react-router";
import DashboardHeader from "~/components/layouts/headers/header.dashboard";
import DashboardSidebar from "~/components/layouts/side-bar/dashboard/side-bar.dashboard";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarToggleProvider } from "~/context/sidebar.context";
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
