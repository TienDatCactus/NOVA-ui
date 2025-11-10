import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useUpdateServiceOrderSchedule } from "../../container/service-pos/mutation.hooks";

interface UpdateScheduleDialogProps {
  orderId: string;
  currentScheduledTime?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateScheduleDialog({
  orderId,
  currentScheduledTime,
  open,
  onOpenChange,
}: UpdateScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(
    currentScheduledTime ? parseISO(currentScheduledTime) : new Date()
  );
  const [time, setTime] = useState<string>(
    currentScheduledTime
      ? format(parseISO(currentScheduledTime), "HH:mm")
      : "09:00"
  );

  const updateSchedule = useUpdateServiceOrderSchedule();

  const handleConfirm = () => {
    if (!date) return;

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDateTime = new Date(date);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    updateSchedule.mutate(
      {
        orderId,
        data: { scheduledAt: scheduledDateTime.toISOString() },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đổi lịch hẹn</DialogTitle>
          <DialogDescription>
            Chọn ngày và giờ mới cho dịch vụ này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Chọn ngày</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={vi}
              className="rounded-md border"
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Chọn giờ</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Preview */}
          {date && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Lịch hẹn mới:</p>
              <p className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "EEEE, dd MMMM yyyy", { locale: vi })} - {time}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!date || updateSchedule.isPending}
          >
            {updateSchedule.isPending ? "Đang cập nhật..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
