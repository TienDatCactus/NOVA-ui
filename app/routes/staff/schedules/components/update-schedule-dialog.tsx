import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Clock, User, Calendar as CalendarDaysIcon, Repeat } from "lucide-react";
import { toast } from "sonner";
import { StaffShiftSchema } from "~/services/api/staff-shift/staff-shift.schema";
import { StaffShiftService } from "~/services/api/staff-shift";
import { WEEKDAYS } from "~/services/api/staff-shift/staff-shift.type";
import type {
  UpdateShiftScheduleRequest,
  StaffShiftListItem,
} from "~/services/api/staff-shift/dto";
import { useQuery } from "@tanstack/react-query";
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
import { WorkShiftService } from "~/services/api/work-shift";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

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

  // Fetch work shifts for dropdown
  const { data: workShifts } = useQuery({
    queryKey: ["work-shifts-active"],
    queryFn: async () => await WorkShiftService.getActiveWorkShiftList(),
  });

  // Fetch shift detail when dialog opens
  const { data: shiftDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["staff-shift-detail", shift?.id],
    queryFn: async () => {
      if (!shift?.id) return null;
      return await StaffShiftService.getStaffShiftById(shift.id);
    },
    enabled: open && !!shift?.id,
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

  // Load form data from API detail
  useEffect(() => {
    if (shiftDetail?.data && open) {
      const detail = shiftDetail.data;
      form.reset({
        workShiftIds: detail.workShiftId ? [detail.workShiftId] : [],
        repeatWeekly: !!detail.weekDays && detail.weekDays.length > 0,
        weekDays:
          detail.weekDays && detail.weekDays.length > 0
            ? detail.weekDays
            : [1, 2, 3, 4, 5],
        endDate: null,
        excludeHolidays:
          detail.includeHolidays !== undefined ? !detail.includeHolidays : true,
        applyScope: "ThisOnly",
      });
    }
  }, [shiftDetail, open, form]);

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
      toast.error("Có lỗi xảy ra khi cập nhật lịch");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");
  const dayOfWeek = format(workDate, "EEEE", { locale: vi });

  // Get shift name and time from detail or fallback to list item
  const shiftName = shiftDetail?.data?.shiftName || shift.shiftName || "N/A";
  const staffName = shiftDetail?.data?.staffName || shift.staffName || "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col gap-0">
        {/* Header với gradient background */}
        <DialogHeader className="px-6 pt-6 pb-5 bg-gradient-to-br from-background to-muted/20 border-b">
          <DialogTitle className="text-xl">Cập nhật lịch làm việc</DialogTitle>
          {isLoadingDetail ? (
            <div className="space-y-2 pt-3">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                <Clock className="h-3.5 w-3.5" />
                {shiftName}
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                {dayOfWeek}, {formattedDate}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 min-h-0 flex flex-col"
          >
            {/* Thân cuộn */}
            <div className="flex-1 px-6 overflow-y-scroll">
              <div className="space-y-6 py-6">
                {/* Grid 2 cột: Nhân viên + Ca làm việc */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card: Thông tin nhân viên */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <FormLabel className="text-sm font-medium">Nhân viên</FormLabel>
                    </div>
                    {isLoadingDetail ? (
                      <div className="h-11 bg-muted/30 rounded-lg border animate-pulse" />
                    ) : (
                      <div className="p-3 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border h-11 flex items-center">
                        <p className="font-medium text-sm">{staffName}</p>
                      </div>
                    )}
                  </div>

                  {/* Card: Ca làm việc */}
                  <FormField
                    control={form.control}
                    name="workShiftIds"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <FormLabel>Ca làm việc</FormLabel>
                        </div>
                        <Select
                          value={field.value?.[0] || ""}
                          onValueChange={(value) => field.onChange([value])}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Chọn ca làm việc" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workShifts?.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{shift.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Grid 2 cột: Áp dụng + Kết thúc */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="applyScope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Áp dụng thay đổi</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
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
                            <SelectItem value="All">Tất cả các ngày</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          {field.value === "ThisOnly" && "Chỉ cập nhật lịch này"}
                          {field.value === "Forward" &&
                            "Cập nhật từ ngày này trở đi"}
                          {field.value === "All" &&
                            "Cập nhật toàn bộ chuỗi lặp lại"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                                  "w-full h-11 justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(parseISO(field.value), "dd/MM/yyyy", {
                                      locale: vi,
                                    })
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
                              selected={
                                field.value ? parseISO(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : null
                                )
                              }
                              locale={vi}
                              captionLayout="dropdown"
                              fromYear={2000}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-xs">
                          Mặc định +1 tháng
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Card: Lặp lại hàng tuần */}
                <FormField
                  control={form.control}
                  name="repeatWeekly"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="flex items-start gap-3">
                          <Repeat className="h-5 w-5 text-primary mt-0.5" />
                          <div className="space-y-1">
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              Lặp lại hàng tuần
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Tự động áp dụng lịch vào các ngày trong tuần
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Chọn thứ trong tuần */}
                {repeatWeekly && (
                  <FormField
                    control={form.control}
                    name="weekDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn các ngày trong tuần</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {WEEKDAYS.map((day) => {
                            const selected = field.value?.includes(day.value);
                            return (
                              <Button
                                key={day.value}
                                type="button"
                                variant={selected ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-10 font-medium transition-all",
                                  selected && "shadow-md"
                                )}
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
                            );
                          })}
                        </div>
                        <FormDescription className="text-xs">
                          Đã chọn {field.value?.length || 0} ngày
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                {/* Ngày lễ */}
                <FormField
                  control={form.control}
                  name="excludeHolidays"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <div className="space-y-1 flex-1">
                          <FormLabel className="font-medium cursor-pointer">
                            Bỏ qua ngày lễ, Tết
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Không xếp lịch làm việc vào các ngày nghỉ lễ
                          </FormDescription>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer cố định với shadow */}
            <div className="px-6 py-4 border-t bg-background/95 backdrop-blur-sm shrink-0 shadow-lg">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingDetail}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
