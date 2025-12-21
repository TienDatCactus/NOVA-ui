import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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

import { Input } from "~/components/ui/input";
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
  const additionalStaffIds = form.watch("additionalStaffIds");
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Thiết lập lịch làm việc</DialogTitle>
          <DialogDescription>
            Phân công ca và thiết lập chu kỳ lặp lại cho nhân viên.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] divide-y md:divide-y-0 md:divide-x overflow-hidden">
              <div className="flex flex-col h-full bg-muted/10">
                <div className="p-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="primaryStaffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                          Nhân viên chính
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
                                <span className="truncate">
                                  {field.value
                                    ? staffList.find(
                                        (s) => s.id === field.value
                                      )?.fullName
                                    : "Chọn nhân viên"}
                                </span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[260px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput placeholder="Tìm nhân viên..." />
                              <CommandList>
                                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                <CommandGroup>
                                  {staffList
                                    .filter((i) => i.status !== "Terminated")
                                    .map((staff) => {
                                      const isSelected =
                                        staff.id === field.value;
                                      return (
                                        <CommandItem
                                          value={staff.fullName}
                                          key={staff.id}
                                          disabled={isSelected}
                                          onSelect={() => {
                                            field.onChange(staff.id);
                                            form.setValue(
                                              "additionalStaffIds",
                                              []
                                            );
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
                                      );
                                    })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                        Nhân viên phụ
                      </FormLabel>
                      {(additionalStaffIds?.length ?? 0) > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1 text-[10px]"
                        >
                          +{additionalStaffIds?.length ?? 0}
                        </Badge>
                      )}
                    </div>

                    <Input
                      startAddon={
                        <Search className=" h-4 w-4 text-muted-foreground" />
                      }
                      placeholder="Tìm nhân viên phụ..."
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="additionalStaffIds"
                  render={({ field }) => (
                    <FormItem className="flex-1 overflow-auto px-2 pb-2">
                      <div className="space-y-1">
                        {availableStaffForAdditional.map((staff) => {
                          const isSelected =
                            field.value?.includes(staff.id) ?? false;
                          return (
                            <FormControl key={staff.id}>
                              <div
                                onClick={() => {
                                  const updatedValue = isSelected
                                    ? (field.value ?? []).filter(
                                        (id) => id !== staff.id
                                      )
                                    : [...(field.value ?? []), staff.id];
                                  field.onChange(updatedValue);
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-2 rounded-md cursor-pointer select-none text-sm transition-colors",
                                  isSelected
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-muted"
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground"
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <span className="truncate">
                                  {staff.fullName}
                                </span>
                              </div>
                            </FormControl>
                          );
                        })}
                        {availableStaffForAdditional.length === 0 && (
                          <p className="text-xs text-center text-muted-foreground mt-4">
                            Không tìm thấy
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- RIGHT COL: CONFIGURATION --- */}
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* 1. Shifts */}
                  <FormField
                    control={form.control}
                    name="workShiftIds"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Ca làm việc
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
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
                                    key={shift.id}
                                    className={cn(
                                      "flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer transition-colors",
                                      isChecked
                                        ? "border-primary bg-primary/5"
                                        : "hover:bg-muted/50"
                                    )}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const updatedValue = checked
                                            ? [...(field.value ?? []), shift.id]
                                            : (field.value ?? []).filter(
                                                (value) => value !== shift.id
                                              );
                                          field.onChange(updatedValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="flex items-center gap-2">
                                      <p className="text-sm font-medium leading-none">
                                        {shift.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {shift.startTime.slice(0, 5)} -{" "}
                                        {shift.endTime.slice(0, 5)}
                                      </p>
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

                  <Separator />

                  {/* 2. Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày bắt đầu</FormLabel>
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
                                captionLayout="dropdown"
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
                          <FormLabel>Ngày kết thúc</FormLabel>
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
                                captionLayout="dropdown"
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
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 3. Recurrence */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <FormField
                      control={form.control}
                      name="repeatWeekly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Lặp lại hàng tuần
                            </FormLabel>
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
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="weekDays"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-xs font-normal text-muted-foreground">
                                Các ngày trong tuần
                              </FormLabel>
                              <div className="justify-between flex items-center">
                                <div className="flex flex-wrap gap-2">
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
                                          <FormItem key={day.value}>
                                            <FormControl>
                                              <div
                                                onClick={() => {
                                                  const updatedValue = isChecked
                                                    ? (
                                                        field.value ?? []
                                                      ).filter(
                                                        (v) => v !== day.value
                                                      )
                                                    : [
                                                        ...(field.value ?? []),
                                                        day.value,
                                                      ];
                                                  field.onChange(updatedValue);
                                                }}
                                                className={cn(
                                                  "h-9 w-9 rounded-full flex items-center justify-center text-sm border cursor-pointer select-none transition-all",
                                                  isChecked
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background hover:bg-muted"
                                                )}
                                              >
                                                {day.label
                                                  .replace("Thứ ", "T")
                                                  .replace("Chủ nhật", "CN")}
                                              </div>
                                            </FormControl>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                                <Button
                                  className="mt-2"
                                  onClick={() => {
                                    const allDays = WEEKDAYS.map(
                                      (day) => day.value
                                    );
                                    form.setValue("weekDays", allDays);
                                  }}
                                >
                                  Cả tuần
                                </Button>
                              </div>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="excludeHolidays"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm text-muted-foreground">
                                Tự động bỏ qua ngày Lễ/Tết
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="px-6 py-4 border-t ">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createShiftSchedule.isPending}>
                {createShiftSchedule.isPending ? "Đang xử lý..." : "Lưu lịch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
