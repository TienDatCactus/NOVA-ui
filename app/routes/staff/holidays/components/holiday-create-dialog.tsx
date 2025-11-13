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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Loader2, CalendarDays, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { HolidayService } from "~/services/api/holiday";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "~/lib/utils";

const CreateHolidayFormSchema = z.object({
  name: z.string().min(1, "Tên ngày nghỉ là bắt buộc"),
  startDate: z.date({ message: "Ngày bắt đầu là bắt buộc" }),
  endDate: z.date({ message: "Ngày kết thúc là bắt buộc" }),
  isPublicHoliday: z.boolean(),
  bonusAmount: z.number().min(0, "Số tiền thưởng phải >= 0"),
});

type CreateHolidayForm = z.infer<typeof CreateHolidayFormSchema>;

interface CreateHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateHolidayDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateHolidayDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateHolidayForm>({
    resolver: zodResolver(CreateHolidayFormSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      isPublicHoliday: false,
      bonusAmount: 0,
    },
  });

  const handleSubmit = async (data: CreateHolidayForm) => {
    setIsPending(true);
    try {
      // Format dates to yyyy-MM-dd
      const payload = {
        name: data.name,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        isPublicHoliday: data.isPublicHoliday,
        bonusAmount: data.bonusAmount,
      };
      await HolidayService.createHoliday(payload);
      toast.success("Tạo ngày nghỉ thành công");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Create holiday error:", error);
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
              <DialogTitle className="text-xl">Thêm ngày nghỉ mới</DialogTitle>
              <DialogDescription className="mt-1">
                Tạo ngày nghỉ lễ cho nhân viên khách sạn
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
                      Tên ngày nghỉ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tết Nguyên Đán, Quốc Khánh..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tên mô tả ngày nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
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
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 100}
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Ngày bắt đầu của kỳ nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
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
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 100}
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Ngày kết thúc của kỳ nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bonus Amount */}
              <FormField
                control={form.control}
                name="bonusAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tiền thưởng 
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
                    <FormDescription className="text-xs">
                      Số tiền thưởng cho nhân viên làm việc trong ngày nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Public Holiday */}
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
                {isPending ? "Đang tạo..." : "Tạo ngày nghỉ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
