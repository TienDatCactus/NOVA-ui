import { addMinutes, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type ScheduledTimeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (servedAt: string) => void;
  bookingInfo?: string;
};

export default function ScheduledTimeDialog({
  open,
  onOpenChange,
  onConfirm,
  bookingInfo,
}: ScheduledTimeDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeString, setTimeString] = useState("");
  const [error, setError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize with "Now" on open
  useEffect(() => {
    if (open) {
      const now = new Date();
      setSelectedDate(now);
      setTimeString(format(now, "HH:mm"));
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!timeString) {
      setError("Vui lòng chọn thời gian");
      return;
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    // Create UTC timestamp
    const finalDateTime = new Date(
      Date.UTC(year, month, day, hours, minutes, 0, 0)
    );

    onConfirm(finalDateTime.toISOString());
  };

  const handlePresetTime = (minutesOffset: number) => {
    const newTime = addMinutes(new Date(), minutesOffset);
    setSelectedDate(newTime);
    setTimeString(format(newTime, "HH:mm"));
    setError("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden outline-none">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Thời gian phục vụ
          </DialogTitle>
          {bookingInfo && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
              <span className="font-semibold uppercase tracking-wider opacity-70">
                Booking:
              </span>
              <span className="font-mono font-medium">{bookingInfo}</span>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. HERO DIGITAL CLOCK DISPLAY */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="flex items-baseline gap-2 text-primary">
              <span className="text-5xl font-bold tracking-tighter font-mono variant-numeric-tabular">
                {timeString || "--:--"}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground capitalize">
              {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
            </p>
          </div>

          {/* 2. QUICK PRESETS (The most common actions) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetTime(0)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary hover:bg-primary/10 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold">Ngay bây giờ</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(30)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs font-medium">+30 Phút</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(60)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs font-medium">+1 Giờ</span>
            </button>
          </div>

          {/* 3. MANUAL INPUTS (Collapsible detail feel) */}
          <div className="space-y-4 rounded-xl border bg-muted/5 p-4">
            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Tùy chỉnh thời gian
            </Label>

            <div className="grid grid-cols-5 gap-3">
              {/* Date Picker (Span 3) */}
              <div className="col-span-3">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background h-10 px-3",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {isToday ? "Hôm nay" : format(selectedDate, "dd/MM")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      locale={vi}
                      disabled={{ before: new Date() }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker (Span 2) */}
              <div className="col-span-2 relative">
                <Input
                  type="time"
                  value={timeString}
                  onChange={(e) => {
                    setTimeString(e.target.value);
                    setError("");
                  }}
                  className="h-10 bg-background font-mono text-center appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <Timer className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive text-center animate-pulse">
              {error}
            </p>
          )}
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 bg-muted/5 border-t">
          <Button
            className="w-full font-semibold shadow-md"
            onClick={handleConfirm}
          >
            Xác nhận thời gian
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
