import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { BookingLineChart } from "./components/line.chart";
import { BookingPieChart } from "./components/pie.chart";
import { BookingRadarChart } from "./components/radar.chart";
import { BookingStackedBarChart } from "./components/stacked-bar.chart";
import { Button } from "~/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { vi } from "react-day-picker/locale";
import { useState } from "react";
import { set } from "zod";
import { formatDate } from "date-fns";
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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <p>Từ ngày :</p>
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
                {date.from
                  ? formatDate(date.from, "dd/MM/yyyy", { locale: vi })
                  : "Select date"}
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
          <p>Đến ngày :</p>
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
                {date.to
                  ? formatDate(date.to, "dd/MM/yyyy", { locale: vi })
                  : "Select date"}
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
        <Button>Áp dụng</Button>
        <Button variant={"outline"}>Hiện tại</Button>
      </div>
      <div className="flex gap-4">
        <BookingStackedBarChart className="flex-2 w-auto flex-col justify-between" />
        <BookingLineChart className="flex-1 flex-col justify-between" />
      </div>
      <div className="flex gap-4">
        <BookingPieChart className="flex-1 flex-col justify-between" />
        <BookingRadarChart className="flex-2 flex-col justify-between" />
      </div>
    </div>
  );
}
