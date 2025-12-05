import { useState, useEffect, useMemo } from "react";
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
import { Clock, CalendarIcon, ArrowRight, History, Zap } from "lucide-react";
import {
  format,
  addMinutes,
  parseISO,
  isValid,
  isToday,
  isTomorrow,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

type UpdateScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scheduledAt: Date) => void;
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
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      if (currentScheduledTime) {
        const scheduledDate = parseISO(currentScheduledTime);
        setSelectedDate(scheduledDate);
        setTimeString(format(scheduledDate, "HH:mm"));
      } else {
        const now = new Date();
        setSelectedDate(now);
        setTimeString(format(now, "HH:mm"));
      }
    }
  }, [open, currentScheduledTime]);

  // Calculated Result (Real-time Preview)
  const finalDateTime = useMemo(() => {
    if (!timeString || !selectedDate) return null;

    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const result = new Date(selectedDate);
    result.setHours(hours);
    result.setMinutes(minutes);
    result.setSeconds(0);
    result.setMilliseconds(0);

    return isValid(result) ? result : null;
  }, [selectedDate, timeString]);

  const handleConfirm = () => {
    if (finalDateTime) {
      onConfirm(finalDateTime);
      onOpenChange(false);
    }
  };

  const handlePresetTime = (minutesOffset: number) => {
    const newTime = addMinutes(new Date(), minutesOffset);
    setSelectedDate(newTime); // Reset date to now + offset
    setTimeString(format(newTime, "HH:mm"));
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hôm nay";
    if (isTomorrow(date)) return "Ngày mai";
    return format(date, "EEEE", { locale: vi });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Cập nhật thời gian phục vụ
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh thời gian chuẩn bị hoặc giao đơn hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Current Info Block */}
          {currentScheduledTime && (
            <div className="flex items-start gap-3 p-3 text-sm rounded-lg bg-blue-50 text-blue-900 border border-blue-100">
              <History className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium block mb-0.5">
                  Thời gian hiện tại:
                </span>
                <span className="font-mono">
                  {format(parseISO(currentScheduledTime), "HH:mm - dd/MM/yyyy")}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions / Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Zap className="w-3.5 h-3.5" /> Thao tác nhanh
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Ngay bây giờ", offset: 0 },
                { label: "+ 15 phút", offset: 15 },
                { label: "+ 30 phút", offset: 30 },
                { label: "+ 1 tiếng", offset: 60 },
                { label: "+ 2 tiếng", offset: 120 },
                {
                  label: "Ngày mai",
                  customAction: () => {
                    const tmr = new Date();
                    tmr.setDate(tmr.getDate() + 1);
                    tmr.setHours(9, 0, 0, 0); // Default to 9:00 AM tomorrow
                    setSelectedDate(tmr);
                    setTimeString("09:00");
                  },
                },
              ].map((preset, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    preset.customAction
                      ? preset.customAction()
                      : handlePresetTime(preset.offset!)
                  }
                  className="text-xs h-9 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Manual Selection */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-2">
              <Label className="text-sm font-semibold">Ngày</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {selectedDate ? (
                      <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setCalendarOpen(false);
                      }
                    }}
                    locale={vi}
                    disabled={{ before: new Date() }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold">Giờ</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  className="h-10 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Result Preview */}
          <div className="rounded-lg bg-muted/40 p-4 flex items-center justify-between border">
            <span className="text-sm text-muted-foreground font-medium">
              Sẽ cập nhật thành:
            </span>
            {finalDateTime ? (
              <div className="text-right">
                <div className="font-bold text-primary flex items-center gap-2 justify-end">
                  {getDateLabel(finalDateTime)}
                  <Badge
                    variant="outline"
                    className="bg-background text-foreground ml-1"
                  >
                    {format(finalDateTime, "HH:mm")}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(finalDateTime, "dd 'tháng' MM, yyyy", { locale: vi })}
                </div>
              </div>
            ) : (
              <span className="text-sm text-destructive">
                Thời gian không hợp lệ
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!finalDateTime}
            className="min-w-[100px]"
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
