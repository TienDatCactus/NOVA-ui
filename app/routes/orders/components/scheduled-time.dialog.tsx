import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Clock, CalendarIcon } from "lucide-react";
import { format, addMinutes, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

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
  useEffect(() => {
    if (open) {
      const defaultTime = new Date(); // Changed from addMinutes(new Date(), 30) to now
      setSelectedDate(defaultTime);
      setTimeString(format(defaultTime, "HH:mm"));
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!timeString) {
      setError("Vui lòng chọn thời gian phục vụ");
      return;
    }

    // Parse time and combine with selected date
    const [hours, minutes] = timeString.split(":").map(Number);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    // Use Date.UTC to create UTC timestamp to avoid timezone conversion
    const finalDateTime = new Date(
      Date.UTC(year, month, day, hours, minutes, 0, 0)
    );

    const servedAtISO = finalDateTime.toISOString();
    onConfirm(servedAtISO);
    setError("");
  };

  const handleCancel = () => {
    setError("");
    onOpenChange(false);
  };

  const handlePresetTime = (minutesOffset: number) => {
    const newTime = addMinutes(new Date(), minutesOffset);
    setSelectedDate(newTime);
    setTimeString(format(newTime, "HH:mm"));
    setError("");
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeString(e.target.value);
    setError("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Preserve the current time when changing date
      const [hours, minutes] = timeString.split(":").map(Number);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const newDateTime = new Date(
        year,
        month,
        day,
        hours || 0,
        minutes || 0,
        0,
        0
      );
      setSelectedDate(newDateTime);
      setCalendarOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Thời gian phục vụ</DialogTitle>
              <DialogDescription>
                Chọn ngày và thời gian mong muốn phục vụ đơn hàng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {bookingInfo && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p className="font-medium text-foreground mb-1">
                Thông tin booking
              </p>
              <p>{bookingInfo}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="served-date" className="text-sm font-medium">
              Ngày phục vụ <span className="text-destructive">*</span>
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    "hover:bg-accent"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={vi}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="served-time" className="text-sm font-medium">
              Giờ phục vụ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="served-time"
              type="time"
              value={timeString}
              onChange={handleTimeChange}
              startAddon={<Clock className="h-4 w-4" />}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Thời gian này sẽ được ghi nhận để bếp chuẩn bị đúng lúc
            </p>
          </div>

          <div className="bg-muted/30 p-3 rounded-md space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Gợi ý thời gian:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Ngay bây giờ", offset: 0 },
                { label: "15 phút nữa", offset: 15 },
                { label: "30 phút nữa", offset: 30 },
                { label: "1 giờ nữa", offset: 60 },
                { label: "2 giờ nữa", offset: 120 },
              ].map((preset) => (
                <Button
                  key={preset.offset}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetTime(preset.offset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
