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
import type { DayPicker } from "react-day-picker";

interface DatePickerProps {
  value?: string | Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disablePast?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  className,
  disablePast = false,
  ...props
}: DatePickerProps & React.ComponentProps<typeof DayPicker>) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value && format(value, "dd/MM/yyyy", { locale: vi })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...props}
          mode="single"
          selected={
            value instanceof Date ? value : value ? new Date(value) : undefined
          }
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          locale={vi}
          disabled={disablePast ? { before: new Date() } : props.disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
