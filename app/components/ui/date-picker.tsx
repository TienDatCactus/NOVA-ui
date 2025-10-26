import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  disabledDates,
  fromDate,
  toDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: vi }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          disabled={disabledDates}
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  );
}
