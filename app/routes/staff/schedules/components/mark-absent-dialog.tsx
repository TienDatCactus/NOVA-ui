import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { StaffAttendanceService } from "~/services/api/staff/staff-attendance";
import type {
  MarkAbsentRequest,
  StaffAttendanceListItem,
} from "~/services/api/staff/staff-attendance/dto";
import { StaffAttendanceSchema } from "~/services/api/staff/staff-attendance/staff-attendance.schema";

const { MarkAbsentRequestSchema } = StaffAttendanceSchema;

interface MarkAbsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: StaffAttendanceListItem | null;
  onSuccess?: () => void;
}

export default function MarkAbsentDialog({
  open,
  onOpenChange,
  attendance,
  onSuccess,
}: MarkAbsentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<{ reason: string }>({
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit: SubmitHandler<{ reason: string }> = async (data) => {
    if (!attendance?.id) {
      toast.error("Không tìm thấy thông tin chấm công");
      return;
    }

    // Validate length
    if (data.reason.length > 200) {
      form.setError("reason", {
        message: "Lý do không được vượt quá 200 ký tự",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send reason if it's not empty
      const payload: MarkAbsentRequest = {
        reason: data.reason.trim() || "",
      };

      await StaffAttendanceService.markAbsent(attendance.id, payload);
      toast.success("Đánh dấu vắng mặt thành công");
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!attendance) return null;

  const workDate = attendance.workDate
    ? parseISO(attendance.workDate)
    : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Đánh dấu vắng mặt cho một phân công ca làm việc
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Nhân viên:</span>
              <span className="font-medium">{attendance.staffName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ca làm việc:</span>
              <span className="font-medium">{attendance.shiftName}</span>
              <span className="text-xs text-muted-foreground">
                ({attendance.startTime.substring(0, 5)} -{" "}
                {attendance.endTime.substring(0, 5)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ngày:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do vắng mặt (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập lý do vắng mặt..."
                        className="min-h-[100px]"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/200
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : "Đánh dấu vắng mặt"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
