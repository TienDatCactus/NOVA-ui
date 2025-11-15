import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { StaffShiftSchema } from "~/services/api/staff-shift/staff-shift.schema";
import { StaffShiftService } from "~/services/api/staff-shift";
import { WEEKDAYS } from "~/services/api/staff-shift/staff-shift.type";
import type { CreateShiftScheduleRequest } from "~/services/api/staff-shift/dto";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Calendar } from "~/components/ui/calendar";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff";
import { WorkShiftService } from "~/services/api/work-shift";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";

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
  const [selectedAdditionalStaff, setSelectedAdditionalStaff] = useState<string[]>([]);

  const { data: staffListResponse } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => await StaffService.getStaffList(),
  });
  const { data: workShifts } = useQuery({
    queryKey: ["work-shifts-active"],
    queryFn: async () => await WorkShiftService.getActiveWorkShiftList(),
  });
  const staffList = staffListResponse?.data || [];

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

  const stopWheel = (e: React.WheelEvent) => e.stopPropagation();
  const stopTouch = (e: React.TouchEvent) => e.stopPropagation();

  const repeatWeekly = form.watch("repeatWeekly");

  useEffect(() => {
    form.setValue("additionalStaffIds", selectedAdditionalStaff);
  }, [selectedAdditionalStaff, form]);

  const onSubmit = async (data: CreateShiftScheduleRequest) => {
    setIsSubmitting(true);
    try {
      await StaffShiftService.createShiftSchedule(data);
      toast.success("Tạo lịch làm việc thành công");
      form.reset();
      setSelectedAdditionalStaff([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = (staffId: string) => {
    if (!selectedAdditionalStaff.includes(staffId)) {
      setSelectedAdditionalStaff([...selectedAdditionalStaff, staffId]);
    }
  };
  const handleRemoveStaff = (staffId: string) => {
    setSelectedAdditionalStaff(selectedAdditionalStaff.filter((id) => id !== staffId));
  };

  const filteredStaff = staffList?.filter((s) =>
    s.fullName.toLowerCase().includes(searchStaff.toLowerCase())
  );

  const primaryStaffId = form.watch("primaryStaffId");
  const selectedStaff = staffList?.filter((s) => selectedAdditionalStaff.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* h-[90vh] + layout cột */}
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        {/* Header sticky, không cuộn */}
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 z-10 bg-background">
          <DialogTitle>Thêm lịch làm việc</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          {/* Thân cuộn độc lập với scrollbar luôn hiện */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 px-6 overflow-y-scroll">
              <div className="space-y-6 pb-6">
                {/* THÔNG TIN NHÂN VIÊN */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">THÔNG TIN NHÂN VIÊN</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Nhân viên chính */}
                    <FormField
                      control={form.control}
                      name="primaryStaffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhân viên chính *</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between h-11">
                                  {field.value
                                    ? staffList?.find((s) => s.id === field.value)?.fullName
                                    : "Chọn nhân viên"}
                                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[300px] p-0"
                                align="start"
                                onWheel={stopWheel}
                                onTouchMove={stopTouch}
                              >
                                <div className="max-h-64 overflow-y-auto">
                                  <div className="p-2 space-y-1">
                                    {staffList?.map((staff) => (
                                      <Button
                                        key={staff.id}
                                        variant="ghost"
                                        className="w-full justify-start h-auto py-2"
                                        onClick={() => field.onChange(staff.id)}
                                      >
                                        <div className="text-left">
                                          <div className="font-medium">{staff.fullName}</div>
                                          <div className="text-xs text-muted-foreground">{staff.code}</div>
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Thêm nhân viên */}
                    <div className="space-y-2">
                      <FormLabel>Chọn nhân viên (Tùy chọn)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start h-11">
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm nhân viên
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[300px] p-0"
                          align="start"
                          onWheel={stopWheel}
                          onTouchMove={stopTouch}
                        >
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Tìm kiếm..."
                              className="w-full px-3 py-2 text-sm border rounded-md"
                              value={searchStaff}
                              onChange={(e) => setSearchStaff(e.target.value)}
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {filteredStaff?.map((staff) => {
                                const isSelected = selectedAdditionalStaff.includes(staff.id);
                                const isPrimary = staff.id === primaryStaffId;
                                if (isPrimary) return null;
                                return (
                                  <div
                                    key={staff.id}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors",
                                      isSelected && "bg-accent"
                                    )}
                                    onClick={() => {
                                      if (isSelected) handleRemoveStaff(staff.id);
                                      else handleAddStaff(staff.id);
                                    }}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{staff.fullName}</div>
                                      <div className="text-xs text-muted-foreground">{staff.code}</div>
                                    </div>
                                    <Checkbox checked={isSelected} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {selectedStaff && selectedStaff.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/30 rounded-md">
                          {selectedStaff.map((staff) => (
                            <Badge key={staff.id} variant="secondary" className="gap-1 py-1">
                              {staff.fullName}
                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(staff.id)}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t" />

                {/* CA LÀM VIỆC & LỊCH TRÌNH */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">CA LÀM VIỆC & LỊCH TRÌNH</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Ca làm */}
                    <FormField
                      control={form.control}
                      name="workShiftIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chọn ca làm *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full justify-between h-11">
                                  {field.value?.length ? `${field.value.length} ca được chọn` : "Chọn ca làm việc"}
                                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0"
                              align="start"
                              onWheel={stopWheel}
                              onTouchMove={stopTouch}
                            >
                              <Command>
                                <CommandInput placeholder="Tìm ca làm..." />
                                <CommandList className="max-h-64 overflow-y-auto">
                                  <CommandEmpty>Không tìm thấy ca làm.</CommandEmpty>
                                  <CommandGroup>
                                    {workShifts?.map((shift) => {
                                      const isSelected = field.value?.includes(shift.id);
                                      return (
                                        <CommandItem
                                          key={shift.id}
                                          onSelect={() => {
                                            const newValue = isSelected
                                              ? field.value.filter((id) => id !== shift.id)
                                              : [...field.value, shift.id];
                                            field.onChange(newValue);
                                          }}
                                        >
                                          <div className="flex items-center w-full">
                                            <Checkbox checked={isSelected} className="mr-2" />
                                            <div className="flex-1">
                                              <div className="font-medium">{shift.name}</div>
                                              <div className="text-xs text-muted-foreground">
                                                {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                                              </div>
                                            </div>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {field.value?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value.map((shiftId) => {
                                const shift = workShifts?.find((s) => s.id === shiftId);
                                if (!shift) return null;
                                return (
                                  <Badge key={shiftId} variant="secondary" className="gap-1">
                                    {shift.name}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange(field.value.filter((id) => id !== shiftId))}
                                      className="ml-1 hover:bg-destructive/20 rounded-full"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ngày bắt đầu / Kết thúc */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày bắt đầu *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn("w-full justify-start text-left font-normal h-11", !field.value && "text-muted-foreground")}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? format(parseISO(field.value), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" onWheel={stopWheel} onTouchMove={stopTouch}>
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? parseISO(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                    locale={vi}
                                    captionLayout="dropdown"
                                    fromYear={2000}
                                    toYear={new Date().getFullYear() + 10}
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
                              <FormLabel>Kết thúc</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn("w-full justify-start text-left font-normal h-11", !field.value && "text-muted-foreground")}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? format(parseISO(field.value), "dd/MM/yyyy", { locale: vi }) : "Chưa xác định"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" onWheel={stopWheel} onTouchMove={stopTouch}>
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? parseISO(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                                    locale={vi}
                                    captionLayout="dropdown"
                                    fromYear={2000}
                                    toYear={new Date().getFullYear() + 10}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription className="text-xs">Nếu để trống, mặc định là 3 tháng</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lặp lại hàng tuần */}
                  <FormField
                    control={form.control}
                    name="repeatWeekly"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Lặp lại hàng tuần</FormLabel>
                          <FormDescription className="text-xs">
                            Lịch làm việc sẽ được tự động lặp lại vào các ngày trong tuần
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tuần */}
                {repeatWeekly && (
                  <>
                    <div className="border-t" />
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
                                          className="min-w-[90px]"
                                          onClick={() => {
                                            if (selected) {
                                              field.onChange(field.value.filter((v: number) => v !== day.value));
                                            } else {
                                              field.onChange([...field.value, day.value]);
                                            }
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
                            Lặp lại thứ {form.watch("weekDays")?.length || 0} hàng tuần
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Ngày lễ */}
                <div className="border-t pt-4 pb-20">
                  <FormField
                    control={form.control}
                    name="excludeHolidays"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 bg-muted/30 rounded-md">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Không xếp lịch vào ngày lễ</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Footer sticky: luôn hiện ở đáy dialog */}
            <div className="px-6 py-4 border-t bg-background shrink-0">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
