import React from "react";
import { Outlet, useSearchParams } from "react-router";
import DashboardHeader from "~/components/layouts/headers/header.dashboard";
import DashboardSidebar from "~/components/layouts/side-bar/side-bar.dashboard";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarToggleProvider } from "~/context/SidebarContext";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <SidebarToggleProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col overflow-hidden relative">
            <DashboardHeader />
            <div
              className={cn(
                "rounded-md p-4 w-full mx-auto bg-white  h-full overflow-auto"
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
