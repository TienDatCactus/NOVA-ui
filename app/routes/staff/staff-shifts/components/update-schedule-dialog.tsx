import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  User,
  CalendarDays,
  AlertCircle,
  ArrowRight,
  Repeat,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { StaffShiftSchema } from "~/services/api/staff/staff-shift/staff-shift.schema";
import { WEEKDAYS } from "~/services/api/staff/staff-shift/staff-shift.type";
import type {
  UpdateShiftScheduleRequest,
  StaffShiftListItem,
} from "~/services/api/staff/staff-shift/dto";
import {
  useStaffShiftById,
  useUpdateShiftSchedule,
} from "../container/query.hooks";
import { useActiveWorkShiftList } from "~/routes/work-shifts/container/query.hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
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
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

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
}: UpdateScheduleDialogProps) {
  const { data: workShifts } = useActiveWorkShiftList();
  const { data: shiftDetail, isLoading: isLoadingDetail } = useStaffShiftById(
    shift?.id || "",
    { enabled: open && !!shift?.id }
  );

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

  // Load form data
  useEffect(() => {
    if (shiftDetail && open) {
      const detail = shiftDetail;
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
  const applyScope = form.watch("applyScope");
  const updateShiftSchedule = useUpdateShiftSchedule();

  // Auto-clear repeat settings when ThisOnly is selected
  useEffect(() => {
    if (applyScope === "ThisOnly") {
      form.setValue("repeatWeekly", false);
      form.setValue("weekDays", []);
      form.setValue("endDate", null);
    }
  }, [applyScope, form]);

  // Auto-enable repeatWeekly when Forward/All is selected
  useEffect(() => {
    if (applyScope !== "ThisOnly" && !repeatWeekly) {
      form.setValue("repeatWeekly", true);
      // Set default weekdays if empty
      const currentWeekDays = form.getValues("weekDays");
      if (!currentWeekDays || currentWeekDays.length === 0) {
        form.setValue("weekDays", [1, 2, 3, 4, 5]);
      }
    }
  }, [applyScope, repeatWeekly, form]);

  const onSubmit = async (data: UpdateShiftScheduleRequest) => {
    if (!shift?.id) {
      toast.error("Không tìm thấy thông tin");
      return;
    }
    try {
      await updateShiftSchedule.mutateAsync({ id: shift.id, data });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  // UX: Hiển thị tên & ca rõ ràng để user không sửa nhầm
  const staffName = shiftDetail?.staffName || shift.staffName || "...";
  const currentShiftName = shiftDetail?.shiftName || shift.shiftName || "...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/5">
          <DialogTitle className="text-lg">
            Điều chỉnh lịch làm việc
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <span className="font-medium text-foreground">{staffName}</span>
            <span className="text-muted-foreground">•</span>
            <span>{formattedDate}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-medium">{currentShiftName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* === SCROLLABLE BODY === */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* 1. CA LÀM VIỆC MỚI */}
              <FormField
                control={form.control}
                name="workShiftIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Chuyển sang ca
                    </FormLabel>
                    <Select
                      value={field.value?.[0] || ""}
                      onValueChange={(value) => field.onChange([value])}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Chọn ca làm việc mới" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workShifts?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <span className="font-medium">{s.name}</span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              ({s.startTime.slice(0, 5)} -{" "}
                              {s.endTime.slice(0, 5)})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* 2. PHẠM VI ÁP DỤNG (CRITICAL UX) */}
              <FormField
                control={form.control}
                name="applyScope"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">
                      Phạm vi áp dụng
                    </FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    >
                      {/* Option 1: Chỉ hôm nay */}
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="ThisOnly"
                            id="scope-this"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <label
                          htmlFor="scope-this"
                          className="flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary w-full h-full"
                        >
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <div className="w-2 h-2 rounded-full bg-current" />
                            Chỉ hôm nay
                          </div>
                          <p className="text-xs text-muted-foreground pl-4">
                            Chỉ sửa ngày {formattedDate}
                          </p>
                        </label>
                      </FormItem>

                      {/* Option 2: Từ nay về sau */}
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="Forward"
                            id="scope-forward"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <label
                          htmlFor="scope-forward"
                          className="flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary w-full h-full"
                        >
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Từ hôm nay
                          </div>
                          <p className="text-xs text-muted-foreground pl-4">
                            Cập nhật từ {formattedDate} trở đi
                          </p>
                        </label>
                      </FormItem>

                      {/* Option 3: Tất cả */}
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value="All"
                            id="scope-all"
                            className="peer sr-only"
                          />
                        </FormControl>
                        <label
                          htmlFor="scope-all"
                          className="flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary w-full h-full"
                        >
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <Repeat className="w-3.5 h-3.5" />
                            Toàn bộ
                          </div>
                          <p className="text-xs text-muted-foreground pl-4">
                            Toàn bộ chuỗi lặp (kể cả quá khứ)
                          </p>
                        </label>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />

              {/* 3. CẤU HÌNH LẶP LẠI */}
              <div className="space-y-2">
                {applyScope === "ThisOnly" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      Chỉ áp dụng cho ngày {formattedDate}, không cần cấu hình
                      lặp lại
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "transition-all",
                    applyScope === "ThisOnly"
                      ? "opacity-50 pointer-events-none grayscale"
                      : "opacity-100"
                  )}
                >
                  <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/5">
                    <FormField
                      control={form.control}
                      name="repeatWeekly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              Lặp lại hàng tuần
                            </FormLabel>
                            <DialogDescription className="text-xs">
                              Tự động tạo lịch vào các ngày cố định
                            </DialogDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {repeatWeekly && (
                      <FormField
                        control={form.control}
                        name="weekDays"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {WEEKDAYS.map((day) => {
                                const isSelected = field.value?.includes(
                                  day.value
                                );
                                return (
                                  <div
                                    key={day.value}
                                    onClick={() => {
                                      const current = field.value || [];
                                      if (isSelected)
                                        field.onChange(
                                          current.filter((v) => v !== day.value)
                                        );
                                      else
                                        field.onChange([...current, day.value]);
                                    }}
                                    className={cn(
                                      "h-9 w-9 rounded-full flex items-center justify-center text-sm border cursor-pointer select-none transition-all",
                                      isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                    )}
                                  >
                                    {day.label
                                      .replace("Thứ ", "T")
                                      .replace("Chủ nhật", "CN")}
                                  </div>
                                );
                              })}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {repeatWeekly && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-xs">
                                Ngày kết thúc
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal h-9",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? format(
                                            parseISO(field.value),
                                            "dd/MM/yyyy"
                                          )
                                        : "Mặc định 1 tháng"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? parseISO(field.value)
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      field.onChange(
                                        date ? format(date, "yyyy-MM-dd") : null
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="excludeHolidays"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-end space-x-2 space-y-0 h-full pb-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm text-muted-foreground cursor-pointer">
                                Trừ ngày Lễ/Tết
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={updateShiftSchedule.isPending || isLoadingDetail}
              >
                {updateShiftSchedule.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
