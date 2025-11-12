import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Card } from "~/components/ui/card";
import { TimePicker24h } from "~/components/ui/time-picker-24h";
import { Loader2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { WorkShiftService } from "~/services/api/work-shift";
import { toast } from "sonner";
import type { WorkShiftListItem } from "~/services/api/work-shift/dto";

// Helper function to ensure 24h format (HH:mm:ss)
function formatTimeTo24h(time: string): string {
  if (!time) return "";
  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  // If in HH:mm format, add :00
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  return time;
}

const UpdateWorkShiftFormSchema = z.object({
  code: z.string().min(1, "Mã ca làm việc là bắt buộc"),
  name: z.string().min(1, "Tên ca làm việc là bắt buộc"),
  startTime: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Giờ kết thúc là bắt buộc"),
  active: z.boolean(),
});

type UpdateWorkShiftForm = z.infer<typeof UpdateWorkShiftFormSchema>;

interface UpdateWorkShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workShift: WorkShiftListItem | null;
  onSuccess?: () => void;
}

export default function UpdateWorkShiftDialog({
  open,
  onOpenChange,
  workShift,
  onSuccess,
}: UpdateWorkShiftDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpdateWorkShiftForm>({
    resolver: zodResolver(UpdateWorkShiftFormSchema),
    defaultValues: {
      code: "",
      name: "",
      startTime: "",
      endTime: "",
      active: true,
    },
  });

  // Update form when workShift changes
  useEffect(() => {
    if (workShift) {
      form.reset({
        code: workShift.code,
        name: workShift.name,
        startTime: workShift.startTime,
        endTime: workShift.endTime,
        active: workShift.active,
      });
    }
  }, [workShift, form]);

  const handleSubmit = async (data: UpdateWorkShiftForm) => {
    if (!workShift) return;

    setIsPending(true);
    try {
      // Ensure time is in HH:mm:ss format
      const payload = {
        ...data,
        startTime: formatTimeTo24h(data.startTime),
        endTime: formatTimeTo24h(data.endTime),
      };
      await WorkShiftService.updateWorkShift(workShift.id, payload);
      toast.success("Cập nhật ca làm việc thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Update work shift error:", error);
      // Error toast handled by http interceptor
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Cập nhật ca làm việc</DialogTitle>
              <DialogDescription className="mt-1">
                Chỉnh sửa thông tin ca làm việc
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <div className="space-y-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Mã ca làm việc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SANG, CHIEU, TOI..." {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Mã định danh ca làm việc
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tên ca làm việc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Ca sáng, Ca chiều, Ca tối..." {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tên mô tả ca làm việc
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Giờ bắt đầu <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <TimePicker24h
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn giờ bắt đầu"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Thời gian bắt đầu ca làm việc (định dạng 24h)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Giờ kết thúc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <TimePicker24h
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn giờ kết thúc"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Thời gian kết thúc ca làm việc (định dạng 24h)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <Card className="p-4 border-muted bg-muted/30">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Trạng thái hoạt động
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Cho phép sử dụng ca làm việc này trong hệ thống
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </Card>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
