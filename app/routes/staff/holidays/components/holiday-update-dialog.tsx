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
import { DatePicker } from "~/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Loader2, CalendarDays, ChevronDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { HolidayService } from "~/services/api/holiday";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "~/lib/utils";
import type { HolidayListItem } from "~/services/api/holiday/dto";

const UpdateHolidayFormSchema = z.object({
  name: z.string().min(1, "Tên ngày nghỉ là bắt buộc"),
  startDate: z.date({ message: "Ngày bắt đầu là bắt buộc" }),
  endDate: z.date({ message: "Ngày kết thúc là bắt buộc" }),
  isPublicHoliday: z.boolean(),
  bonusAmount: z.number().min(0, "Số tiền thưởng phải >= 0"),
});

type UpdateHolidayForm = z.infer<typeof UpdateHolidayFormSchema>;

interface UpdateHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayListItem | null;
  onSuccess?: () => void;
}

export default function UpdateHolidayDialog({
  open,
  onOpenChange,
  holiday,
  onSuccess,
}: UpdateHolidayDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpdateHolidayForm>({
    resolver: zodResolver(UpdateHolidayFormSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      isPublicHoliday: false,
      bonusAmount: 0,
    },
  });

  // Update form when holiday changes
  useEffect(() => {
    if (holiday) {
      form.reset({
        name: holiday.name,
        startDate: parseISO(holiday.startDate),
        endDate: parseISO(holiday.endDate),
        isPublicHoliday: holiday.isPublicHoliday,
        bonusAmount: holiday.bonusAmount,
      });
    }
  }, [holiday, form]);

  const handleSubmit = async (data: UpdateHolidayForm) => {
    if (!holiday) return;

    setIsPending(true);
    try {
      const payload = {
        name: data.name,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        isPublicHoliday: data.isPublicHoliday,
        bonusMultiplier: undefined,
        bonusAmount: data.bonusAmount,
      };
      await HolidayService.updateHoliday(holiday.id, payload);
      toast.success("Cập nhật ngày nghỉ thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Update holiday error:", error);
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
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Cập nhật ngày nghỉ</DialogTitle>
              <DialogDescription className="mt-1">
                Chỉnh sửa thông tin ngày nghỉ lễ
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tên ngày nghỉ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Tết Nguyên Đán..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Ngày bắt đầu <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày bắt đầu</span>
                            )}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          fromYear={2000}
                          toYear={new Date().getFullYear() + 10}
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Ngày kết thúc <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày kết thúc</span>
                            )}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          fromYear={2000}
                          toYear={new Date().getFullYear() + 10}
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bonusAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tiền thưởng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublicHoliday"
                render={({ field }) => (
                  <FormItem>
                    <Card className="p-4 border-muted bg-muted/30">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Trạng thái ngày nghỉ
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Đánh dấu là ngày lễ chính thức của quốc gia
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
