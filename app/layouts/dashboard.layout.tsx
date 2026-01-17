import {
  BookDown,
  Calendar,
  Download,
  Loader2,
  SearchIcon,
  Undo2,
} from "lucide-react";
import React from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { toast } from "sonner";
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
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Kbd } from "~/components/ui/kbd";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { useExportGuestDocumentsMutation } from "~/features/guest-documents/container/container";
import { ModeToggle } from "~/features/theme/toggler";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { COMMAND_BAR_ROUTES } from "~/lib/constants";
import { DASHBOARD } from "~/lib/fe-url";
import { cn } from "~/lib/utils";
const DashboardLayout: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [exportDateFrom, setExportDateFrom] = React.useState<Date | undefined>(
    undefined,
  );
  const [exportDateTo, setExportDateTo] = React.useState<Date | undefined>(
    undefined,
  );
  const navigate = useNavigate();
  const exportMutation = useExportGuestDocumentsMutation();

  const handleExportGuestDocuments = async () => {
    if (!exportDateFrom || !exportDateTo) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    try {
      const fromDate = exportDateFrom.toISOString().split("T")[0];
      const toDate = exportDateTo.toISOString().split("T")[0];

      const blob: any = await exportMutation.mutateAsync({
        checkInFrom: fromDate,
        checkInTo: toDate,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `guest-documents-${fromDate}-${toDate}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportDialogOpen(false);
      setExportDateFrom(undefined);
      setExportDateTo(undefined);
    } catch (error) {
      toast.error("Xuất file XML thất bại");
    }
  };
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
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) && (
                <Button asChild size={"sm"} variant={"info-outline"}>
                  <Link to={DASHBOARD.bookings.newBooking}>
                    Đặt phòng <BookDown />
                  </Link>
                </Button>
              )}
              {hasAnyRole(AuthLoader.getUser(), [
                UserRole.Receptionist,
                UserRole.HotelManager,
              ]) && (
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => setExportDialogOpen(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Xuất giấy tờ (XML)
                </Button>
              )}
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
              "rounded-md w-full mx-auto bg-background flex-1 overflow-y-auto min-h-0 container",
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

      {/* Export Guest Documents Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xuất giấy tờ khách hàng (XML)</DialogTitle>
            <DialogDescription>
              Chọn khoảng thời gian check-in để xuất file XML giấy tờ tùy thân
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-date-from">Từ ngày</Label>
              <DatePicker
                id="export-date-from"
                value={exportDateFrom}
                onChange={setExportDateFrom}
                placeholder="Chọn ngày bắt đầu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-date-to">Đến ngày</Label>
              <DatePicker
                id="export-date-to"
                value={exportDateTo}
                onChange={setExportDateTo}
                placeholder="Chọn ngày kết thúc"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExportDialogOpen(false);
                setExportDateFrom(undefined);
                setExportDateTo(undefined);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleExportGuestDocuments}
              disabled={
                !exportDateFrom || !exportDateTo || exportMutation.isPending
              }
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Xuất XML
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardLayout;
