import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { CreateWorkShiftRequest } from "~/services/api/work-shift/dto";
import { WorkShiftSchema } from "~/services/api/work-shift/work-shift.schema";
import { useCreateWorkShift } from "../container/mutation.hooks";

interface CreateWorkShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateWorkShiftDialog({
  open,
  onOpenChange,
}: CreateWorkShiftDialogProps) {
  const form = useForm<CreateWorkShiftRequest>({
    resolver: zodResolver(WorkShiftSchema.CreateWorkShiftRequestSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
    },
  });

  const { mutateAsync: createWorkShift, isPending } = useCreateWorkShift();
  const handleSubmit = async (data: CreateWorkShiftRequest) => {
    try {
      await createWorkShift(
        {
          name: data.name,
          endTime: data.endTime,
          startTime: data.startTime,
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Thêm ca làm việc mới</DialogTitle>
          <DialogDescription>
            Tạo ca làm việc mới cho nhân viên khách sạn
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
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
                      <Input
                        type="time"
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
                      <Input
                        type="time"
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
            <DialogFooter className="gap-2">
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
