import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
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
import { Card } from "~/components/ui/card";
import { TimePicker24h } from "~/components/ui/time-picker-24h";
import { Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { WorkShiftService } from "~/services/api/staff/work-shift";
import { WorkShiftSchema } from "~/services/api/staff/work-shift/work-shift.schema";
import { toast } from "sonner";

const { CreateWorkShiftFormSchema } = WorkShiftSchema;

// Helper function to ensure 24h format (HH:mm:ss)
function formatTimeTo24h(time: string): string {
  if (!time) return "";
  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  // If in HH:mm format, add :00
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  return time;
}

type CreateWorkShiftForm = z.infer<typeof CreateWorkShiftFormSchema>;

interface CreateWorkShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateWorkShiftDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkShiftDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateWorkShiftForm>({
    resolver: zodResolver(CreateWorkShiftFormSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
    },
  });

  const handleSubmit = async (data: CreateWorkShiftForm) => {
    setIsPending(true);
    try {
      // Ensure time is in HH:mm:ss format
      const payload = {
        ...data,
        startTime: formatTimeTo24h(data.startTime),
        endTime: formatTimeTo24h(data.endTime),
      };
      await WorkShiftService.createWorkShift(payload);
      toast.success("Tạo ca làm việc thành công");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Create work shift error:", error);
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
              <DialogTitle className="text-xl">
                Thêm ca làm việc mới
              </DialogTitle>
              <DialogDescription className="mt-1">
                Tạo ca làm việc mới cho nhân viên khách sạn
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
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tên ca làm việc{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Ca sáng, Ca chiều, Ca tối..."
                        {...field}
                      />
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
                {isPending ? "Đang tạo..." : "Tạo ca làm việc"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
