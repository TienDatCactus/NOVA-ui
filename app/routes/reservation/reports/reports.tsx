import { format } from "date-fns";
import { ChevronDownIcon, TableIcon } from "lucide-react";
import { useState } from "react";
import { vi } from "react-day-picker/locale";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/reports";
import { ReportsTableModal } from "./components/reports-table-modal";
import useReports from "./container/reservation-reports-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Báo Cáo - NOVA Hotel Management" },
    { name: "description", content: "Báo cáo và thống kê đặt phòng" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Reports, Permission.Read);

export default function Component() {
  const [open, setOpen] = useState<{
    from: boolean;
    to: boolean;
  }>({
    from: false,
    to: false,
  });

  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });

  const [showTableModal, setShowTableModal] = useState(false);

  // Format dates for API call
  const fromDateStr = date.from ? format(date.from, "yyyy-MM-dd") : "";
  const toDateStr = date.to ? format(date.to, "yyyy-MM-dd") : "";

  // Fetch reports data
  const { data: reportsData, isLoading } = useReports({
    fromDate: fromDateStr,
    toDate: toDateStr,
  });

  const handleResetToToday = () => {
    const today = new Date();
    setDate({ from: today, to: today });
  };

  return (
    <div className="flex flex-col gap-4 p-4 ">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <p>Từ ngày:</p>
            <Popover
              open={open.from}
              onOpenChange={() => {
                setOpen({ ...open, from: !open.from });
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {date.from ? format(date.from, "dd/MM/yyyy") : "Chọn ngày"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  locale={vi}
                  mode="single"
                  selected={date.from}
                  captionLayout="dropdown"
                  onSelect={(data) => {
                    setDate({ ...date, from: data });
                    setOpen({
                      ...open,
                      from: false,
                      to: open.to,
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 items-center">
            <p>Đến ngày:</p>
            <Popover
              open={open.to}
              onOpenChange={() => {
                setOpen({ ...open, to: !open.to });
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {date.to ? format(date.to, "dd/MM/yyyy") : "Chọn ngày"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  locale={vi}
                  mode="single"
                  selected={date.to}
                  captionLayout="dropdown"
                  onSelect={(data) => {
                    setDate({ ...date, to: data });
                    setOpen({
                      ...open,
                      to: false,
                      from: open.from,
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={handleResetToToday}>
            Hiện tại
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowTableModal(true)}
          className="gap-2"
        >
          <TableIcon className="h-4 w-4" />
          Xem dạng bảng
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="flex-2 h-[450px]" />
            <Skeleton className="flex-1 h-[450px]" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="flex-1 h-[450px]" />
            <Skeleton className="flex-2 h-[450px]" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-4"></div>
          <div className="flex gap-4"></div>
        </>
      )}

      <ReportsTableModal
        open={showTableModal}
        onOpenChange={setShowTableModal}
      />
    </div>
  );
}
