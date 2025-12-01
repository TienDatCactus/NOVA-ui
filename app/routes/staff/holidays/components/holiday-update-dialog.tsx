import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, ChevronDownIcon, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card } from "~/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import type {
  HolidayListItem,
  UpdateHolidayRequest,
} from "~/services/api/holiday/dto";
import { HolidaySchema } from "~/services/api/holiday/holiday.schema";
import { useUpdateHoliday } from "../container/mutation.hooks";

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
  const form = useForm<UpdateHolidayRequest>({
    resolver: zodResolver(HolidaySchema.UpdateHolidayRequestSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      isPublicHoliday: false,
      bonusAmount: 0,
    },
  });
  const { mutateAsync: updateHoliday, isPending } = useUpdateHoliday();
  useEffect(() => {
    if (holiday) {
      form.reset({
        bonusAmount: holiday.bonusAmount ?? 0,
        name: holiday.name,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        isPublicHoliday: holiday.isPublicHoliday,
      });
    }
  }, [holiday, form]);

  const handleSubmit = async (data: UpdateHolidayRequest) => {
    if (!holiday) return;

    try {
      await updateHoliday(
        {
          holidayId: holiday.id,
          payload: data,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    } catch (error) {
      console.error("Update holiday error:", error);
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
                          selected={new Date(field.value)}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
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
                          selected={new Date(field.value)}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
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
                        type="text"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
