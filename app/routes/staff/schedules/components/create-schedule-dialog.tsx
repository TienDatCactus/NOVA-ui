import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Repeat,
  Users,
  X,
  Search,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

import { StaffService } from "~/services/api/staff/staff";
import { StaffShiftService } from "~/services/api/staff/staff-shift";
import type { CreateShiftScheduleRequest } from "~/services/api/staff/staff-shift/dto";
import { StaffShiftSchema } from "~/services/api/staff/staff-shift/staff-shift.schema";
import { WEEKDAYS } from "~/services/api/staff/staff-shift/staff-shift.type";
import { WorkShiftService } from "~/services/api/staff/work-shift";

const { CreateShiftScheduleRequestSchema } = StaffShiftSchema;

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateScheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchStaff, setSearchStaff] = useState("");
  const [selectedAdditionalStaff, setSelectedAdditionalStaff] = useState<
    string[]
  >([]);

  // --- Queries ---
  const { data: staffList = [] } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => await StaffService.getStaffList(),
    enabled: open,
  });

  const { data: workShifts = [] } = useQuery({
    queryKey: ["work-shifts-active"],
    queryFn: async () => await WorkShiftService.getActiveWorkShiftList(),
    enabled: open,
  });

  // --- Form Setup ---
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

  useEffect(() => {
    form.setValue("additionalStaffIds", selectedAdditionalStaff);
  }, [selectedAdditionalStaff, form]);

  // --- Handlers ---
  const onSubmit = async (data: CreateShiftScheduleRequest) => {
    setIsSubmitting(true);
    try {
      await StaffShiftService.createShiftSchedule(data);
      toast.success("Đã tạo lịch làm việc thành công");
      form.reset();
      setSelectedAdditionalStaff([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo lịch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdditionalStaff = (id: string) => {
    setSelectedAdditionalStaff((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter staff logic
  const availableStaffForAdditional = staffList.filter(
    (s) =>
      s.id !== primaryStaffId &&
      s.fullName.toLowerCase().includes(searchStaff.toLowerCase())
  );

  const primaryStaffName = staffList.find(
    (s) => s.id === primaryStaffId
  )?.fullName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0 bg-background overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-8 py-5 border-b shrink-0 bg-muted/5">
          <DialogTitle className="text-xl flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Thiết lập lịch làm việc
          </DialogTitle>
          <DialogDescription>
            Phân công ca làm việc cho nhân viên và thiết lập chu kỳ lặp lại.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* === BODY (Split View) === */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* LEFT COL: PEOPLE (35%) */}
              <div className="w-full md:w-[35%] border-r bg-muted/10 flex flex-col">
                <div className="p-6 pb-2">
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary uppercase tracking-wider">
                    <Users className="w-4 h-4" /> Nhân sự áp dụng
                  </div>

                  {/* Primary Staff */}
                  <FormField
                    control={form.control}
                    name="primaryStaffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nhân viên chính{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between bg-background",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? staffList.find((s) => s.id === field.value)
                                      ?.fullName
                                  : "Chọn nhân viên"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
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
                                  {staffList.map((staff) => (
                                    <CommandItem
                                      value={staff.fullName}
                                      key={staff.id}
                                      onSelect={() => field.onChange(staff.id)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          staff.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{staff.fullName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {staff.code}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="mb-2" />

                {/* Additional Staff (Scrollable List) */}
                <div className="flex-1 flex flex-col px-6 pb-4 min-h-0">
                  <div className="mb-2 flex items-center justify-between">
                    <FormLabel className="text-xs text-muted-foreground">
                      Nhân viên phụ (Cùng lịch)
                    </FormLabel>
                    {selectedAdditionalStaff.length > 0 && (
                      <Badge variant="secondary">
                        {selectedAdditionalStaff.length} đã chọn
                      </Badge>
                    )}
                  </div>

                  <div className="relative mb-3">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Tìm thêm nhân viên..."
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="flex-1 -mr-4 pr-4">
                    <div className="space-y-2">
                      {availableStaffForAdditional.map((staff) => {
                        const isSelected = selectedAdditionalStaff.includes(
                          staff.id
                        );
                        return (
                          <div
                            key={staff.id}
                            onClick={() =>
                              handleToggleAdditionalStaff(staff.id)
                            }
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all hover:shadow-sm",
                              isSelected
                                ? "bg-primary/5 border-primary/50"
                                : "bg-background border-transparent hover:bg-background hover:border-border"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {staff.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {staff.code}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {availableStaffForAdditional.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground py-4">
                          Không tìm thấy kết quả
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* RIGHT COL: SCHEDULE (65%) */}
              <div className="w-full md:w-[65%] flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-8">
                    {/* 1. Shift Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                        <Clock className="w-4 h-4" /> Thời gian làm việc
                      </div>

                      <FormField
                        control={form.control}
                        name="workShiftIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Ca làm việc{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {workShifts.map((shift) => {
                                const isSelected = field.value?.includes(
                                  shift.id
                                );
                                return (
                                  <div
                                    key={shift.id}
                                    onClick={() => {
                                      const current = field.value || [];
                                      const newValue = current.includes(
                                        shift.id
                                      )
                                        ? current.filter(
                                            (id) => id !== shift.id
                                          )
                                        : [...current, shift.id];
                                      field.onChange(newValue);
                                    }}
                                    className={cn(
                                      "cursor-pointer rounded-lg border p-3 flex items-start gap-3 transition-all",
                                      isSelected
                                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                        : "hover:border-primary/50 hover:bg-muted/20"
                                    )}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      className="mt-1"
                                    />
                                    <div>
                                      <p className="font-medium text-sm">
                                        {shift.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                        {shift.startTime.slice(0, 5)} -{" "}
                                        {shift.endTime.slice(0, 5)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Bắt đầu từ</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? format(parseISO(field.value), "PPP", {
                                            locale: vi,
                                          })
                                        : "Chọn ngày"}
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
                                        date ? format(date, "yyyy-MM-dd") : ""
                                      )
                                    }
                                    initialFocus
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
                              <FormLabel>Kết thúc</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? format(parseISO(field.value), "PPP", {
                                            locale: vi,
                                          })
                                        : "Chọn ngày"}
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
                                        date ? format(date, "yyyy-MM-dd") : ""
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* 2. Recurrence Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                          <Repeat className="w-4 h-4" /> Quy tắc lặp lại
                        </div>

                        <FormField
                          control={form.control}
                          name="repeatWeekly"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Lặp lại hàng tuần
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {repeatWeekly && (
                        <div className="bg-muted/30 rounded-xl p-5 border space-y-5 animate-in slide-in-from-top-2">
                          <FormField
                            control={form.control}
                            name="weekDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground mb-3 block">
                                  Áp dụng cho các thứ
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                  {WEEKDAYS.map((day) => {
                                    const isSelected = field.value?.includes(
                                      day.value
                                    );
                                    return (
                                      <div
                                        key={day.value}
                                        className={cn(
                                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all border select-none",
                                          isSelected
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
                                        )}
                                        onClick={() => {
                                          if (isSelected) {
                                            field.onChange(
                                              field.value?.filter(
                                                (v) => v !== day.value
                                              )
                                            );
                                          } else {
                                            field.onChange([
                                              ...(field.value || []),
                                              day.value,
                                            ]);
                                          }
                                        }}
                                      >
                                        {day.label
                                          .replace("Thứ ", "T")
                                          .replace("Chủ nhật", "CN")}
                                      </div>
                                    );
                                  })}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="excludeHolidays"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal">
                                    Tự động bỏ qua ngày Lễ/Tết
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="px-8 py-5 border-t shrink-0 bg-background sm:justify-between">
              <div className="text-sm text-muted-foreground hidden md:block">
                {primaryStaffName ? (
                  <span>
                    Đang xếp lịch cho: <strong>{primaryStaffName}</strong>{" "}
                    {selectedAdditionalStaff.length > 0 &&
                      `và ${selectedAdditionalStaff.length} người khác`}
                  </span>
                ) : (
                  <span>Vui lòng chọn nhân viên chính</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? "Đang xử lý..." : "Lưu lịch làm việc"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
