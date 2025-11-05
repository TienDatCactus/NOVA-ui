import { BookDown, SearchIcon } from "lucide-react";
import React from "react";
import { Link, Outlet } from "react-router";
import { AppSidebar } from "~/components/layouts/side-bar/dashboard/side-bar.dashboard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Kbd } from "~/components/ui/kbd";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { DASHBOARD } from "~/lib/fe-url";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative ml-0">
          <header className="h-12 shadow-sm py-6 px-4 z-10 bg-white flex items-center w-full sticky top-0 justify-between border-b">
            <SidebarTrigger />
            <div className="flex gap-2 items-center">
              <Button asChild variant={"pink-outline"}>
                <Link to={DASHBOARD.reservation.newBooking}>
                  Đặt phòng <BookDown />
                </Link>
              </Button>

              <Input
                placeholder="Tìm kiếm..."
                className="w-64 h-8 placeholder:text-sm"
                startAddon={<SearchIcon />}
                endAddon={
                  <Kbd>
                    <pre>Ctrl + K</pre>
                  </Kbd>
                }
              />
            </div>
          </header>
          <div
            className={cn(
              "rounded-md p-4 w-full mx-auto bg-background flex-1 overflow-auto"
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
