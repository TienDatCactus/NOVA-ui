import React from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "~/components/layouts/side-bar/dashboard/side-bar.dashboard";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarTrigger />
        <main className="flex-1 flex flex-col overflow-hidden relative">
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
  );
};

export default DashboardLayout;
