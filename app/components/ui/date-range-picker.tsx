import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState({ from: false, to: false });

  const handleRangeChange = (newRange: DateRange | undefined) => {
    onChange?.(newRange);
  };

  const formatDateRange = () => {
    if (value?.from && value?.to) {
      return `${format(value.from, "dd/MM/yyyy")} - ${format(value.to, "dd/MM/yyyy")}`;
    }
    if (value?.from) {
      return format(value.from, "dd/MM/yyyy");
    }
    return placeholder;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal",
              !value?.from && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formatDateRange()}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Date Range Row */}
            <div className="flex gap-3 items-start">
              {/* From Date */}
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">Từ ngày:</div>
                <Popover
                  open={openCalendar.from}
                  onOpenChange={(isOpen) =>
                    setOpenCalendar({ ...openCalendar, from: isOpen })
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value?.from
                        ? format(value.from, "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={vi}
                      mode="single"
                      selected={value?.from}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        handleRangeChange({ ...value, from: date });
                        setOpenCalendar({ ...openCalendar, from: false });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">Đến ngày:</div>
                <Popover
                  open={openCalendar.to}
                  onOpenChange={(isOpen) =>
                    setOpenCalendar({ ...openCalendar, to: isOpen })
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value?.to
                        ? format(value.to, "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={vi}
                      mode="single"
                      selected={value?.to}
                      captionLayout="dropdown"
                      disabled={(date) =>
                        value?.from ? date < value.from : false
                      }
                      onSelect={(date) => {
                        handleRangeChange({ ...value, to: date });
                        setOpenCalendar({ ...openCalendar, to: false });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  handleRangeChange(undefined);
                  setOpen(false);
                }}
              >
                Xóa
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
