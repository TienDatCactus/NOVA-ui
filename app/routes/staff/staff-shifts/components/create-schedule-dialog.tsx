import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  ChevronDown,
  Loader2,
  Save,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
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
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

import { useActiveWorkShiftList } from "~/routes/work-shifts/container/query.hooks";
import type { CreateShiftScheduleRequest } from "~/services/api/staff/staff-shift/dto";
import { StaffShiftSchema } from "~/services/api/staff/staff-shift/staff-shift.schema";
import { WEEKDAYS } from "~/services/api/staff/staff-shift/staff-shift.type";
import { useStaffList } from "../../staff/container/query.hooks";
import { useCreateShiftSchedule } from "../container/query.hooks";

const { CreateShiftScheduleRequestSchema } = StaffShiftSchema;

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function CreateScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateScheduleDialogProps) {
  const [searchStaff, setSearchStaff] = useState("");

  // --- Queries ---
  const { data: staffList = [] } = useStaffList({});
  const { data: workShifts = [] } = useActiveWorkShiftList();
  const createShiftSchedule = useCreateShiftSchedule();

  const form = useForm<CreateShiftScheduleRequest>({
    resolver: zodResolver(CreateShiftScheduleRequestSchema),
    defaultValues: {
      primaryStaffId: "",
      additionalStaffIds: [],
      workShiftIds: [],
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
      repeatWeekly: true,
      weekDays: [1, 2, 3, 4, 5],
      repeatIntervalWeeks: 1,
      excludeHolidays: true,
    },
  });

  const primaryStaffId = form.watch("primaryStaffId");
  const repeatWeekly = form.watch("repeatWeekly");

  // --- Handlers ---
  const onSubmit = async (data: CreateShiftScheduleRequest) => {
    try {
      await createShiftSchedule.mutateAsync(data, {});
      form.reset();
      setSearchStaff("");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter staff logic
  const availableStaffForAdditional = staffList.filter(
    (s) =>
      s.id !== primaryStaffId &&
      s.fullName.toLowerCase().includes(searchStaff.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <DialogTitle>Thiết lập lịch làm việc</DialogTitle>
          <DialogDescription>
            Phân công ca và thiết lập chu kỳ lặp lại
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row flex-1 overflow-y-auto"
          >
            {/* --- LEFT PANEL: WHO & WHEN (Table Style) --- */}
            <div className="flex-1 p-0">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Nhân sự & Thời gian
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      {/* Primary Staff Row */}
                      <FormRow
                        control={form.control}
                        name="primaryStaffId"
                        label="Nhân viên chính"
                        required
                      >
                        {(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between h-9",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? staffList.find((s) => s.id === field.value)
                                      ?.fullName
                                  : "Chọn nhân viên"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Tìm nhân viên..." />
                                <CommandList>
                                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                  <CommandGroup>
                                    {staffList
                                      .filter((i) => i.status !== "Terminated")
                                      .map((staff) => (
                                        <CommandItem
                                          value={staff.fullName}
                                          key={staff.id}
                                          onSelect={() => {
                                            field.onChange(staff.id);
                                            form.setValue(
                                              "additionalStaffIds",
                                              []
                                            ); // Reset additional if primary changes
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              staff.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {staff.fullName}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                      </FormRow>

                      {/* Additional Staff Row (Multi-select via Popover) */}
                      <FormRow
                        control={form.control}
                        name="additionalStaffIds"
                        label="Nhân viên phụ"
                      >
                        {(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-9 border-dashed text-muted-foreground hover:text-foreground"
                              >
                                <span>
                                  {field.value?.length > 0
                                    ? `Đã chọn ${field.value.length} người`
                                    : "Thêm nhân viên phụ (Tùy chọn)"}
                                </span>
                                <Users className="h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-2"
                              align="start"
                            >
                              <div className="space-y-2">
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <input
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Tìm tên..."
                                    value={searchStaff}
                                    onChange={(e) =>
                                      setSearchStaff(e.target.value)
                                    }
                                  />
                                </div>
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-1">
                                    {availableStaffForAdditional.length ===
                                      0 && (
                                      <div className="text-xs text-muted-foreground text-center py-4">
                                        Không tìm thấy
                                      </div>
                                    )}
                                    {availableStaffForAdditional.map(
                                      (staff) => {
                                        const isSelected =
                                          field.value?.includes(staff.id) ??
                                          false;
                                        return (
                                          <div
                                            key={staff.id}
                                            onClick={() => {
                                              const updatedValue = isSelected
                                                ? (field.value ?? []).filter(
                                                    (id: string) =>
                                                      id !== staff.id
                                                  )
                                                : [
                                                    ...(field.value ?? []),
                                                    staff.id,
                                                  ];
                                              field.onChange(updatedValue);
                                            }}
                                            className={cn(
                                              "flex items-center gap-2 p-2 rounded-sm cursor-pointer hover:bg-muted text-sm",
                                              isSelected &&
                                                "bg-muted font-medium"
                                            )}
                                          >
                                            <div
                                              className={cn(
                                                "h-4 w-4 border rounded flex items-center justify-center",
                                                isSelected
                                                  ? "bg-primary border-primary"
                                                  : "border-muted-foreground"
                                              )}
                                            >
                                              {isSelected && (
                                                <Check className="h-3 w-3 text-white" />
                                              )}
                                            </div>
                                            <span>{staff.fullName}</span>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </FormRow>

                      {/* Start Date */}
                      <FormRow
                        control={form.control}
                        name="startDate"
                        label="Ngày bắt đầu"
                        required
                      >
                        {(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal h-9",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), "PPP", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
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
                                    date ? format(date, "yyyy-MM-dd") : ""
                                  )
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </FormRow>

                      {/* End Date */}
                      <FormRow
                        control={form.control}
                        name="endDate"
                        label="Ngày kết thúc"
                        required
                      >
                        {(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal h-9",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(parseISO(field.value), "PPP", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
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
                                    date ? format(date, "yyyy-MM-dd") : ""
                                  )
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </FormRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* --- RIGHT PANEL: CONFIGURATION (Sidebar Style) --- */}
            <div className="w-full md:w-[380px] bg-muted/10 border-l flex flex-col">
              <div className="p-6 space-y-6">
                {/* 1. Shifts Configuration */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                    Chọn Ca Làm Việc
                  </h3>
                  <FormField
                    control={form.control}
                    name="workShiftIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 gap-2 bg-background border rounded-md p-2 max-h-[250px] overflow-y-auto">
                          {workShifts.map((shift) => (
                            <FormField
                              key={shift.id}
                              control={form.control}
                              name="workShiftIds"
                              render={({ field }) => {
                                const isChecked =
                                  field.value?.includes(shift.id) ?? false;
                                return (
                                  <FormItem
                                    className={cn(
                                      "flex items-center space-x-3 space-y-0 rounded-md border p-2 cursor-pointer transition-colors",
                                      isChecked
                                        ? "border-primary bg-primary/5"
                                        : "hover:bg-muted"
                                    )}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        id={shift.id}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...(field.value ?? []), shift.id]
                                            : (field.value ?? []).filter(
                                                (v) => v !== shift.id
                                              );
                                          field.onChange(updated);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      className="grid gap-0.5"
                                      htmlFor={shift.id}
                                    >
                                      <span className="text-sm font-medium leading-none">
                                        {shift.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {shift.startTime.slice(0, 5)} -{" "}
                                        {shift.endTime.slice(0, 5)}
                                      </span>
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* 2. Recurrence Configuration */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Thiết lập lặp lại
                  </h3>

                  <div className="bg-background border rounded-md p-4 space-y-4">
                    {/* Toggle Switch */}
                    <FormField
                      control={form.control}
                      name="repeatWeekly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0">
                          <FormLabel className="text-sm font-medium">
                            Lặp lại hàng tuần
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Weekday Selection */}
                    {repeatWeekly && (
                      <div className="space-y-3 pt-2 border-t">
                        <FormField
                          control={form.control}
                          name="weekDays"
                          render={() => (
                            <FormItem>
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {WEEKDAYS.map((day) => (
                                  <FormField
                                    key={day.value}
                                    control={form.control}
                                    name="weekDays"
                                    render={({ field }) => {
                                      const isChecked =
                                        field.value?.includes(day.value) ??
                                        false;
                                      return (
                                        <div
                                          onClick={() => {
                                            const updated = isChecked
                                              ? (field.value ?? []).filter(
                                                  (v) => v !== day.value
                                                )
                                              : [
                                                  ...(field.value ?? []),
                                                  day.value,
                                                ];
                                            field.onChange(updated);
                                          }}
                                          className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs border cursor-pointer select-none transition-all",
                                            isChecked
                                              ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                                              : "bg-muted/30 hover:bg-muted text-muted-foreground"
                                          )}
                                        >
                                          {day.label
                                            .replace("Thứ ", "T")
                                            .replace("Chủ nhật", "CN")}
                                        </div>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground w-full mt-2"
                                type="button"
                                onClick={() =>
                                  form.setValue(
                                    "weekDays",
                                    WEEKDAYS.map((d) => d.value)
                                  )
                                }
                              >
                                Chọn tất cả
                              </Button>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="excludeHolidays"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-xs text-muted-foreground">
                                Bỏ qua ngày Lễ/Tết
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
          </form>
        </Form>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-background shrink-0 z-10">
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={createShiftSchedule.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createShiftSchedule.isPending}
            className="min-w-[120px]"
          >
            {createShiftSchedule.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
