import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Check,
  Loader2,
  Search,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { useStaffList, useStaffsHasPayrollinMonth } from "../../staff/container/query.hooks";
import {
  useGeneratePayroll,
  useGenerateSinglePayroll,
} from "../container/query.hooks";

const generatePayrollSchema = z
  .object({
    year: z.number(),
    month: z.number(),
    scope: z.enum(["all", "single"]),
    selectedStaffId: z.string().optional(),
    baseSalaryFullMonth: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.scope === "single" && !data.selectedStaffId) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn nhân viên",
      path: ["selectedStaffId"],
    }
  );

type GeneratePayrollFormData = z.infer<typeof generatePayrollSchema>;

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GeneratePayrollDialog({
  open,
  onOpenChange,
}: GeneratePayrollDialogProps) {
  const currentDate = new Date();

  const [staffSearchOpen, setStaffSearchOpen] = useState(false);

  const form = useForm<GeneratePayrollFormData>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      scope: "all",
      selectedStaffId: "",
      baseSalaryFullMonth: "",
    },
  });

  const scope = form.watch("scope");
  const selectedStaffId = form.watch("selectedStaffId");

  const { data: staffList, isPending: isLoadingStaffs } = useStaffsHasPayrollinMonth(
    form.watch("year"), form.watch("month")
  ) 
  const selectedStaff = staffList?.find((s: any) => s.id === selectedStaffId);

  const { mutate: generateAll, isPending: isGeneratingAll } =
    useGeneratePayroll();
  const { mutate: generateSingle, isPending: isGeneratingSingle } =
    useGenerateSinglePayroll();

  const isPending = isGeneratingAll || isGeneratingSingle;

  const handleSubmit = form.handleSubmit((data) => {
    if (data.scope === "all") {
      generateAll(
        { year: data.year, month: data.month },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      if (!data.selectedStaffId) {
        toast.error("Vui lòng chọn nhân viên");
        return;
      }
      const payload: any = { year: data.year, month: data.month };
      if (data.baseSalaryFullMonth) {
        const parsedValue = parseFloat(data.baseSalaryFullMonth);
        if (!isNaN(parsedValue) && parsedValue > 0) {
          payload.baseSalaryFullMonth = parsedValue;
        }
      }
      generateSingle(
        { staffId: data.selectedStaffId, data: payload },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle className="text-lg font-semibold">
            Tạo bảng lương
          </DialogTitle>
          <DialogDescription>
            Tính toán và chốt lương cho kỳ làm việc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="p-6 space-y-6">
              {/* 1. DATE SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="w-4 h-4" /> Kỳ lương áp dụng
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Tháng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (m) => (
                                <SelectItem key={m} value={m.toString()}>
                                  Tháng {m}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Năm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from(
                              { length: 5 },
                              (_, i) => currentDate.getFullYear() - 2 + i
                            ).map((y) => (
                              <SelectItem key={y} value={y.toString()}>
                                Năm {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* 2. SCOPE SELECTION (Radio Cards) */}
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Users className="w-4 h-4" /> Đối tượng
                    </div>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      {/* Option: All Staff */}
                      <label
                        className={cn(
                          "flex flex-col gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-muted/50",
                          field.value === "all"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border"
                        )}
                      >
                        <RadioGroupItem
                          value="all"
                          id="scope-all"
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <Users
                            className={cn(
                              "w-5 h-5",
                              field.value === "all"
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          {field.value === "all" && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium block">
                            Tất cả nhân viên
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Chạy lương định kỳ
                          </span>
                        </div>
                      </label>

                      {/* Option: Single Staff */}
                      <label
                        className={cn(
                          "flex flex-col gap-2 p-3 border rounded-xl cursor-pointer transition-all hover:bg-muted/50",
                          field.value === "single"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border"
                        )}
                      >
                        <RadioGroupItem
                          value="single"
                          id="scope-single"
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <User
                            className={cn(
                              "w-5 h-5",
                              field.value === "single"
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          {field.value === "single" && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium block">
                            Một nhân viên
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Điều chỉnh cá nhân
                          </span>
                        </div>
                      </label>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3. CONDITIONAL FIELDS (Single Staff) */}
              {scope === "single" && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="selectedStaffId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Chọn nhân viên</FormLabel>
                        <Popover
                          open={staffSearchOpen}
                          onOpenChange={setStaffSearchOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between h-10 px-3",
                                  !selectedStaff && "text-muted-foreground"
                                )}
                              >
                                {selectedStaff ? (
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                                      {selectedStaff.code}
                                    </span>
                                    <span className="truncate">
                                      {selectedStaff.fullName}
                                    </span>
                                    <Badge
                                      variant={"secondary"}
                                      className="truncate"
                                    >
                                      {selectedStaff.staffRoleName}
                                    </Badge>
                                  </div>
                                ) : (
                                  "Tìm kiếm nhân viên..."
                                )}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[450px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput placeholder="Nhập tên hoặc mã nhân viên..." />
                              <CommandList>
                                {isLoadingStaffs ? (
                                  <div className="p-4 flex justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                ) : (
                                  <CommandGroup heading="Danh sách nhân viên">
                                    {staffList?.map((staff: any) => (
                                      <CommandItem
                                        key={staff.id}
                                        value={`${staff.code}-${staff.fullName}`}
                                        onSelect={() => {
                                          field.onChange(staff.id);
                                          setStaffSearchOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedStaffId === staff.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {staff.fullName} -{" "}
                                            {staff.staffRoleName}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {staff.code}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    {" "}
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                    lý...{" "}
                  </>
                ) : (
                  "Tạo bảng lương"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
