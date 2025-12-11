import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Banknote,
  CalendarDays,
  CalendarIcon,
  ChevronDownIcon,
  Loader2,
} from "lucide-react";
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header có background nhẹ để tách biệt */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="w-5 h-5 text-primary" />
            Cập nhật ngày nghỉ lễ
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa kỳ nghỉ và chế độ lương thưởng cho ngày nghỉ{" "}
            <b className="font-bold">{holiday?.name}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Tên ngày nghỉ */}
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
                        placeholder="VD: Tết Nguyên Đán, Giỗ tổ Hùng Vương..."
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Khu vực chọn ngày - Gộp thành 2 cột */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold">
                        Bắt đầu <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>DD/MM/YYYY</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
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
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold">
                        Kết thúc <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>DD/MM/YYYY</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
                            locale={vi}
                            disabled={(date) => {
                              // UX Logic: Không cho chọn ngày kết thúc nhỏ hơn ngày bắt đầu
                              const startDate = form.getValues("startDate");
                              return startDate
                                ? date < new Date(startDate)
                                : false;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tiền thưởng - Thêm icon và hậu tố VND */}
              <FormField
                control={form.control}
                name="bonusAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Thưởng / Phụ cấp
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-9 pr-12 h-10 font-mono"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground">
                          VND
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Áp dụng cho nhân viên đi làm vào ngày này.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Card trạng thái ngày lễ */}
              <FormField
                control={form.control}
                name="isPublicHoliday"
                render={({ field }) => (
                  <FormItem>
                    <Card
                      className={cn(
                        "p-4 border transition-colors",
                        field.value
                          ? "border-primary/50 bg-primary/5"
                          : "border-muted bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between space-x-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold">
                            Ngày lễ Quốc gia (Public Holiday)
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Nhân viên sẽ được hưởng chế độ lương x3 hoặc x4 tùy
                            theo quy định.
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

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="h-10"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 gap-2 min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    "Tạo ngày nghỉ"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
