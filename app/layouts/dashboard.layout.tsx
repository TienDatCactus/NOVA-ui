import React from "react";
import { Outlet } from "react-router";
import DashboardHeader from "~/components/layouts/headers/header.dashboard";
import DashboardSidebar from "~/components/layouts/side-bar/side-bar.dashboard";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full ">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="rounded-md p-4 pt-16 bg-white  h-full w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
