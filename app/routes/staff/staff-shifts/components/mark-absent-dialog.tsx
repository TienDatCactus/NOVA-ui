import { format, parseISO } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";
import { useMarkAbsent } from "../container/query.hooks";

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
  // Mutation
  const markAbsent = useMarkAbsent();

  const form = useForm<{ reason: string }>({
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit: SubmitHandler<{ reason: string }> = async (data) => {
    if (!attendance?.id) {
      toast.error("Không tìm thấy thông tin");
      return;
    }

    if (data.reason.length > 200) {
      form.setError("reason", {
        message: "Lý do quá dài",
      });
      return;
    }

    await markAbsent.mutateAsync(
      {
        assignmentId: attendance.id,
        data: { reason: data.reason.trim() || "" },
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
          onOpenChange(false);
        },
      }
    );
  };

  if (!attendance) return null;

  const workDate = attendance.workDate
    ? parseISO(attendance.workDate)
    : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4  border-b ">
          <DialogTitle>Xác nhận vắng mặt</DialogTitle>
          <DialogDescription>
            Ghi nhận nhân viên nghỉ làm hoặc bỏ ca
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Info Card: Visual Confirmation */}
          <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {attendance.staffName}
                  </p>
                  <p className="text-xs text-muted-foreground">Nhân viên</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> Ngày làm việc
                </div>
                <p className="text-sm font-medium pl-5">{formattedDate}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> Ca làm việc
                </div>
                <div className="pl-5 flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {attendance.shiftName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {attendance.startTime.substring(0, 5)} -{" "}
                    {attendance.endTime.substring(0, 5)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex justify-between">
                      <span>Lý do (Tùy chọn)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập lý do vắng mặt, ghi chú..."
                        className="min-h-[100px] resize-none focus-visible:ring-destructive/20 focus-visible:border-destructive/50"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <span className="text-[10px] text-muted-foreground">
                        {field.value?.length || 0}/200 ký tự
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={markAbsent.isPending}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={markAbsent.isPending}
                  className="gap-2"
                >
                  {markAbsent.isPending ? "Đang xử lý..." : "Xác nhận vắng"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
