import { BookDown, SearchIcon, Undo2 } from "lucide-react";
import React from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { AppSidebar } from "~/components/layouts/side-bar/dashboard/side-bar.dashboard";
import { Button } from "~/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Kbd } from "~/components/ui/kbd";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { ModeToggle } from "~/features/theme/toggler";
import { COMMAND_BAR_ROUTES } from "~/lib/constants";
import { DASHBOARD } from "~/lib/fe-url";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden relative ml-0">
          <header className="h-12 shadow-sm py-6 px-4 z-10 bg-background flex items-center w-full sticky top-0 justify-between border-b">
            <div className="flex gap-2 items-center">
              <SidebarTrigger />
              <Button onClick={() => navigate(-1)} variant={"outline"}>
                <Undo2 /> Quay lại
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Button asChild size={"sm"} variant={"info-outline"}>
                <Link to={DASHBOARD.bookings.newBooking}>
                  Đặt phòng <BookDown />
                </Link>
              </Button>
              <ModeToggle />
              <Input
                placeholder="Tìm kiếm..."
                className="w-64 h-8 placeholder:text-sm"
                startAddon={<SearchIcon />}
                onClick={() => setOpen(true)}
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
              "rounded-md w-full mx-auto bg-background flex-1 overflow-y-auto min-h-0 container"
            )}
          >
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <CommandDialog className="w-xl" open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Tìm kiếm module..." />
        <CommandList>
          <CommandEmpty>Không tìm thấy kết quả nào.</CommandEmpty>
          <CommandGroup heading="Đường dẫn">
            {COMMAND_BAR_ROUTES.map((route) => (
              <CommandItem key={route.name}>
                <Link to={route.href}>
                  {route.icon && <route.icon className="mr-2 inline-block" />}
                  <span>{route.name}</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default DashboardLayout;
