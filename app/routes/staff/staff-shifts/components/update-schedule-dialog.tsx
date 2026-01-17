import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Loader2,
  Repeat,
  Save,
  X,
} from "lucide-react";
import { useEffect } from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
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
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

import { useActiveWorkShiftList } from "~/routes/work-shifts/container/query.hooks";
import type {
  StaffShiftListItem,
  UpdateShiftScheduleRequest,
} from "~/services/api/staff/staff-shift/dto";
import { StaffShiftSchema } from "~/services/api/staff/staff-shift/staff-shift.schema";
import { WEEKDAYS } from "~/services/api/staff/staff-shift/staff-shift.type";
import {
  useStaffShiftById,
  useUpdateShiftSchedule,
} from "../container/query.hooks";

const { UpdateShiftScheduleRequestSchema } = StaffShiftSchema;

interface UpdateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: StaffShiftListItem | null;
  onSuccess?: () => void;
}

// --- Reusable Table Components ---
const LabelCell = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <TableCell className="w-[140px] bg-muted/30 font-medium border-r text-muted-foreground align-top py-3">
    {children} {required && <span className="text-red-500">*</span>}
  </TableCell>
);

const InputCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell className="p-3 align-top border-0">{children}</TableCell>
);

interface FormRowProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  children: (field: any) => React.ReactNode;
  className?: string;
}

const FormRow = <T extends FieldValues>({
  control,
  name,
  label,
  required,
  children,
  className,
}: FormRowProps<T>) => {
  return (
    <TableRow className={`hover:bg-transparent ${className || ""}`}>
      <LabelCell required={required}>{label}</LabelCell>
      <InputCell>
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>{children(field)}</FormControl>
              <FormMessage className="mt-1" />
            </FormItem>
          )}
        />
      </InputCell>
    </TableRow>
  );
};

export default function UpdateScheduleDialog({
  open,
  onOpenChange,
  shift,
}: UpdateScheduleDialogProps) {
  const { data: workShifts } = useActiveWorkShiftList();
  const { data: shiftDetail, isLoading: isLoadingDetail } = useStaffShiftById(
    shift?.id || "",
    { enabled: open && !!shift?.id },
  );

  const updateShiftSchedule = useUpdateShiftSchedule();

  const form = useForm<UpdateShiftScheduleRequest>({
    resolver: zodResolver(UpdateShiftScheduleRequestSchema),
    defaultValues: {
      workShiftIds: [],
      repeatWeekly: false,
      weekDays: shiftDetail?.weekDays || [1, 2, 3, 4, 5],
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

  useEffect(() => {
    if (applyScope === "ThisOnly") {
      form.setValue("repeatWeekly", false);
      form.setValue("weekDays", []);
      form.setValue("endDate", null);
    }
  }, [applyScope, form]);

  useEffect(() => {
    if (applyScope !== "ThisOnly" && !repeatWeekly) {
      form.setValue("repeatWeekly", true);
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
      const formattedData = {
        ...data,
        newDate: data.newDate
          ? format(new Date(data.newDate), "yyyy-MM-dd")
          : data.newDate,
      };

      await updateShiftSchedule.mutateAsync(
        { id: shift.id, data: formattedData },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");
  const staffName = shiftDetail?.staffName || shift.staffName || "...";
  const currentShiftName = shiftDetail?.shiftName || shift.shiftName || "...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>Điều chỉnh lịch làm việc</DialogTitle>
              <DialogDescription>
                Cập nhật ca làm việc hoặc thay đổi lịch trình
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background">
                {staffName}
              </Badge>
              <span className="text-muted-foreground text-xs">|</span>
              <Badge variant="secondary">{formattedDate}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row flex-1 overflow-y-auto"
          >
            {/* === LEFT PANEL: MAIN ACTIONS === */}
            <div className="flex-1 p-0">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Thông tin thay đổi
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-transparent bg-muted/5">
                        <LabelCell>Ca hiện tại</LabelCell>
                        <TableCell className="p-3 text-muted-foreground italic">
                          {currentShiftName}
                        </TableCell>
                      </TableRow>

                      <FormRow
                        control={form.control}
                        name="workShiftIds"
                        label="Chuyển sang ca"
                      >
                        {(field) => (
                          <Select
                            value={field.value?.[0] || ""}
                            onValueChange={(value) => field.onChange([value])}
                          >
                            <SelectTrigger className="h-9 border-0 focus:ring-0">
                              <SelectValue placeholder="Chọn ca làm việc mới" />
                            </SelectTrigger>
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
                        )}
                      </FormRow>

                      {/* Optional: Change Date (Only visible for 'ThisOnly') */}
                      {applyScope === "ThisOnly" && !repeatWeekly && (
                        <FormRow
                          control={form.control}
                          name="newDate"
                          label="Đổi ngày (Tuỳ chọn)"
                        >
                          {(field) => (
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-[200px] justify-start text-left font-normal h-9 border-0 shadow-none hover:bg-transparent px-3",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? (
                                      format(
                                        new Date(field.value),
                                        "dd/MM/yyyy",
                                      )
                                    ) : (
                                      <span>Giữ nguyên ngày cũ</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      field.onChange(
                                        date
                                          ? format(date, "yyyy-MM-dd")
                                          : null,
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => form.resetField("newDate")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </FormRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* === RIGHT PANEL: SCOPE & RECURRENCE === */}
            <div className="w-full md:w-[350px] bg-muted/10 border-l flex flex-col">
              <div className="p-4 space-y-6">
                {/* Scope Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                    Phạm vi áp dụng
                  </h3>
                  <FormField
                    control={form.control}
                    name="applyScope"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-2"
                      >
                        <label
                          className={cn(
                            "flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors bg-background",
                            field.value === "ThisOnly"
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted",
                          )}
                        >
                          <RadioGroupItem value="ThisOnly" id="scope-this" />
                          <div className="grid gap-0.5">
                            <span className="text-sm font-medium">
                              Chỉ ngày này
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Chỉ thay đổi ngày {formattedDate}
                            </span>
                          </div>
                        </label>

                        <label
                          className={cn(
                            "flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors bg-background",
                            field.value === "Forward"
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted",
                          )}
                        >
                          <RadioGroupItem value="Forward" id="scope-forward" />
                          <div className="grid gap-0.5">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <CalendarIcon className="w-3.5 h-3.5" /> Cả tháng
                              này
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Áp dụng cho tất cả ngày trong tháng{" "}
                              {format(workDate, "MM/yyyy")}
                            </span>
                          </div>
                        </label>

                        <label
                          className={cn(
                            "flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors bg-background",
                            field.value === "All"
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted",
                          )}
                        >
                          <RadioGroupItem value="All" id="scope-all" />
                          <div className="grid gap-0.5">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Repeat className="w-3.5 h-3.5" /> Tất cả ca tương
                              lai
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Áp dụng cho tất cả ca đã được phân công trong
                              tương lai
                            </span>
                          </div>
                        </label>
                      </RadioGroup>
                    )}
                  />
                </div>

                <Separator />

                {/* Recurrence Settings */}
                {applyScope !== "ThisOnly" ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-500 rounded-full" />
                      Cấu hình lặp lại
                    </h3>
                    <div className="bg-background border rounded-md p-3 space-y-3">
                      <FormField
                        control={form.control}
                        name="repeatWeekly"
                        render={({ field }) => (
                          <div className="flex flex-row items-center justify-between">
                            <span className="text-sm">Lặp lại hàng tuần</span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />

                      {repeatWeekly && (
                        <>
                          <div className="h-px bg-border/50" />
                          <FormField
                            control={form.control}
                            name="weekDays"
                            render={({ field }) => (
                              <div className="flex flex-wrap gap-1 justify-center pt-1">
                                {WEEKDAYS.map((day) => {
                                  const isSelected = field.value?.includes(
                                    day.value,
                                  );
                                  return (
                                    <div
                                      key={day.value}
                                      onClick={() => {
                                        const current = field.value || [];
                                        field.onChange(
                                          isSelected
                                            ? current.filter(
                                                (v) => v !== day.value,
                                              )
                                            : [...current, day.value],
                                        );
                                      }}
                                      className={cn(
                                        "h-7 w-7 rounded-full flex items-center justify-center text-xs border cursor-pointer select-none transition-all",
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "bg-muted/30 hover:bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {day.label
                                        .replace("Thứ ", "T")
                                        .replace("Chủ nhật", "CN")}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          />
                          <div className="h-px bg-border/50" />
                          <FormField
                            control={form.control}
                            name="excludeHolidays"
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <span className="text-xs text-muted-foreground">
                                  Trừ ngày nghỉ
                                </span>
                              </div>
                            )}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-dashed">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      Không cần cấu hình lặp lại cho thay đổi một lần.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={updateShiftSchedule.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateShiftSchedule.isPending || isLoadingDetail}
            className="min-w-[120px]"
          >
            {updateShiftSchedule.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
