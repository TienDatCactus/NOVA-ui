import {
  addMinutes,
  format,
  isToday,
  isTomorrow,
  isValid,
  parseISO,
  startOfDay,
  set,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  CalendarIcon,
  History,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

type UpdateScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scheduledAt: string) => void; // Changed to string (ISO format)
  currentScheduledTime?: string | null;
};

export default function UpdateScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  currentScheduledTime,
}: UpdateScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    if (open) {
      if (currentScheduledTime) {
        const scheduledDate = parseISO(currentScheduledTime);
        setSelectedDate(startOfDay(scheduledDate));
        setTimeString(format(scheduledDate, "HH:mm"));
      } else {
        const now = new Date();
        setSelectedDate(startOfDay(now));
        setTimeString(format(now, "HH:mm"));
      }
    }
  }, [open, currentScheduledTime]);

  const finalDateTime = useMemo(() => {
    if (!timeString || !selectedDate) return null;

    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const result = set(selectedDate, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });

    return isValid(result) ? result : null;
  }, [selectedDate, timeString]);

  const handleConfirm = () => {
    if (finalDateTime) {
      // Format as ISO string in local timezone (without converting to UTC)
      const isoString = format(finalDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      console.log("Local time:", finalDateTime);
      console.log("ISO String (local):", isoString);
      onConfirm(isoString);
      onOpenChange(false);
    }
  };

  const handlePresetTime = (minutesOffset: number) => {
    const newTime = addMinutes(new Date(), minutesOffset);
    setSelectedDate(startOfDay(newTime));
    setTimeString(format(newTime, "HH:mm"));
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hôm nay";
    if (isTomorrow(date)) return "Ngày mai";
    return format(date, "EEEE", { locale: vi });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            Cập nhật thời gian
          </DialogTitle>
          <DialogDescription>
            Thay đổi thời gian phục vụ cho đơn hàng này.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 px-6 py-5 border-b flex w-full justify-between items-center gap-4">
          {/* OLD TIME */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hiện tại
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <History className="w-4 h-4" />
              {currentScheduledTime ? (
                <div>
                  <p className="font-medium text-sm leading-none">
                    {format(parseISO(currentScheduledTime), "HH:mm")}
                  </p>
                  <p className="text-[10px] mt-0.5">
                    {format(parseISO(currentScheduledTime), "dd/MM")}
                  </p>
                </div>
              ) : (
                <span className="text-sm italic">Chưa đặt</span>
              )}
            </div>
          </div>

          {/* ARROW */}
          <div className="flex justify-center text-muted-foreground/40">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* NEW TIME */}
          <div className="flex flex-col gap-1 items-end text-right">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Mới
            </span>
            {finalDateTime ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-primary">
                  <span className="font-bold text-xl leading-none font-mono bg-primary/10 px-2 py-1 rounded">
                    {format(finalDateTime, "HH:mm")}
                  </span>
                </div>
                <span className="text-xs font-medium text-primary/80 mt-1 flex items-center gap-1">
                  {getDateLabel(finalDateTime)} •{" "}
                  {format(finalDateTime, "dd/MM")}
                </span>
              </div>
            ) : (
              <span className="text-sm text-destructive">Không hợp lệ</span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* PRESETS */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Chọn nhanh
            </Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetTime(0)}
                className="text-xs h-8"
              >
                Ngay bây giờ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetTime(15)}
                className="text-xs h-8"
              >
                + 15 phút
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetTime(30)}
                className="text-xs h-8"
              >
                + 30 phút
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetTime(60)}
                className="text-xs h-8"
              >
                + 1 tiếng
              </Button>
            </div>
          </div>

          <Separator />

          {/* MANUAL INPUT */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Tùy chỉnh
            </Label>

            <div className="flex gap-3">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {selectedDate
                      ? format(selectedDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (d) {
                        setSelectedDate(d);
                      }
                    }}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>

              {/* Time Input */}
              <div className="w-28">
                <Input
                  type="time"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  className="font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-muted/10 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy bỏ
          </Button>
          <Button onClick={handleConfirm} disabled={!finalDateTime}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
