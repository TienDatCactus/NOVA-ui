import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { StaffShiftSchema } from "~/services/api/staff-shift/staff-shift.schema";
import { StaffShiftService } from "~/services/api/staff-shift";
import { WEEKDAYS } from "~/services/api/staff-shift/staff-shift.type";
import type {
  UpdateShiftScheduleRequest,
  StaffShiftListItem,
} from "~/services/api/staff-shift/dto";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { WorkShiftService } from "~/services/api/work-shift";
import { Checkbox } from "~/components/ui/checkbox";
import { fa } from "zod/v4/locales";

const { UpdateShiftScheduleRequestSchema } = StaffShiftSchema;

interface UpdateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: StaffShiftListItem | null;
  onSuccess?: () => void;
}

export default function UpdateScheduleDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: UpdateScheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: workShifts } = useQuery({
    queryKey: ["work-shifts"],
    queryFn: async () => await WorkShiftService.getWorkShiftList(),
  });

  const form = useForm<UpdateShiftScheduleRequest>({
    resolver: zodResolver(UpdateShiftScheduleRequestSchema),
    defaultValues: {
      workShiftIds: [],
      repeatWeekly: false,
      weekDays: [1, 2, 3, 4, 5],
      endDate: null,
      excludeHolidays: true,
      applyScope: "ThisOnly",
    },
  });

  useEffect(() => {
    if (shift && open) {
      form.reset({
        workShiftIds: shift.shiftId ? [shift.shiftId] : [],
        repeatWeekly: false,
        weekDays: [1, 2, 3, 4, 5],
        endDate: null,
        excludeHolidays: true,
        applyScope: "ThisOnly",
      });
    }
  }, [shift, open, form]);

  const repeatWeekly = form.watch("repeatWeekly");

  const stopWheel = (e: React.WheelEvent) => e.stopPropagation();
  const stopTouch = (e: React.TouchEvent) => e.stopPropagation();

  const onSubmit = async (data: UpdateShiftScheduleRequest) => {
    if (!shift?.id) {
      toast.error("Không tìm thấy thông tin lịch làm việc");
      return;
    }

    setIsSubmitting(true);
    try {
      await StaffShiftService.updateShiftSchedule(shift.id, data);
      toast.success("Cập nhật lịch làm việc thành công");
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Layout với chiều cao cố định và flex column */}
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
        {/* Header sticky */}
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 z-10 bg-background">
          <DialogTitle>Cập nhật lịch làm việc</DialogTitle>
          <div className="space-y-1 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ca sáng</span>
              <span className="font-medium">(08:00 - 12:00)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Thứ 2, {formattedDate}</span>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col">
            {/* Thân cuộn với scrollbar luôn hiện */}
            <div className="flex-1 px-6 overflow-y-scroll">
              <div className="space-y-6 pb-6">
                {/* Nhân viên - Read only */}
                <div className="space-y-2">
                  <FormLabel>Nhân viên</FormLabel>
                  <div className="p-3 bg-muted/30 rounded-md border">
                    <div className="space-y-1">
                      <div className="font-medium">{shift.staffName || "N/A"}</div>

                    </div>
                  </div>
                </div>

                {/* Grid 2 cột: Áp dụng thay đổi + Kết thúc */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Áp dụng thay đổi */}
                  <FormField
                    control={form.control}
                    name="applyScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Áp dụng thay đổi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phạm vi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ThisOnly">
                              Chỉ ngày {formattedDate}
                            </SelectItem>
                            <SelectItem value="Forward">
                              Từ {formattedDate} trở đi
                            </SelectItem>
                            <SelectItem value="All">
                              Tất cả các ngày
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          {field.value === "ThisOnly" && "Chỉ cập nhật lịch này"}
                          {field.value === "Forward" && "Cập nhật từ ngày này trở đi"}
                          {field.value === "All" && "Cập nhật toàn bộ chuỗi lặp lại"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Kết thúc */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kết thúc</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(parseISO(field.value), "dd/MM/yyyy", { locale: vi })
                                  : "Chưa xác định"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                            onWheel={stopWheel}
                            onTouchMove={stopTouch}
                          >
                            <Calendar
                              mode="single"
                              selected={field.value ? parseISO(field.value) : undefined}
                              onSelect={(date) =>
                                field.onChange(date ? format(date, "yyyy-MM-dd") : null)
                              }
                              locale={vi}
                              captionLayout="dropdown"
                              fromYear={2000}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-xs">
                          Mặc định +1 tháng nếu để trống
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Separator */}
                <div className="border-t" />

                {/* Lặp lại hàng tuần */}
                <FormField
                  control={form.control}
                  name="repeatWeekly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Lặp lại hàng tuần
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Lịch làm việc sẽ tự động lặp lại vào các ngày trong tuần
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Chọn thứ trong tuần */}
                {repeatWeekly && (
                  <FormField
                    control={form.control}
                    name="weekDays"
                    render={() => (
                      <FormItem>
                        <FormLabel>Chọn thứ trong tuần</FormLabel>
                        <div className="flex gap-2 flex-wrap">
                          {WEEKDAYS.map((day) => (
                            <FormField
                              key={day.value}
                              control={form.control}
                              name="weekDays"
                              render={({ field }) => {
                                const selected = field.value?.includes(day.value);
                                return (
                                  <FormItem key={day.value}>
                                    <FormControl>
                                      <Button
                                        type="button"
                                        variant={selected ? "default" : "outline"}
                                        size="sm"
                                        className="min-w-[80px]"
                                        onClick={() => {
                                          const currentValue = field.value || [];
                                          const newValue = selected
                                            ? currentValue.filter((v) => v !== day.value)
                                            : [...currentValue, day.value];
                                          field.onChange(newValue);
                                        }}
                                      >
                                        {day.label}
                                      </Button>
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormDescription className="text-xs">
                          Lặp lại {form.watch("weekDays")?.length || 0} ngày/tuần
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Separator */}
                <div className="border-t" />

                {/* Làm việc cả ngày lễ tết */}
                <FormField
                  control={form.control}
                  name="excludeHolidays"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 bg-muted/30 rounded-md border">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="font-normal cursor-pointer">
                          Làm việc cả ngày lễ tết
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Bỏ qua các ngày nghỉ lễ khi tạo lịch
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer sticky */}
            <div className="px-6 py-4 border-t bg-background shrink-0">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Bỏ qua
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
