import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff/staff";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  useGeneratePayroll,
  useGenerateSinglePayroll,
} from "../container/query.hooks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useStaffList } from "../../staff/container/query.hooks";

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

  // Fetch staff list
  const { data: staffList, isPending: isLoadingStaffs } = useStaffList({});

  const selectedStaff = staffList?.find((s: any) => s.id === selectedStaffId);

  const { mutate: generateAll, isPending: isGeneratingAll } =
    useGeneratePayroll();
  const { mutate: generateSingle, isPending: isGeneratingSingle } =
    useGenerateSinglePayroll();

  const handleSubmit = form.handleSubmit((data) => {
    if (data.scope === "all") {
      generateAll(
        {
          year: data.year,
          month: data.month,
        },
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
      const payload: any = {
        year: data.year,
        month: data.month,
      };
      if (data.baseSalaryFullMonth) {
        const parsedValue = parseFloat(data.baseSalaryFullMonth);
        if (!isNaN(parsedValue) && parsedValue > 0) {
          payload.baseSalaryFullMonth = parsedValue;
        }
      }
      generateSingle(
        {
          staffId: data.selectedStaffId,
          data: payload,
        },
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo bảng lương</DialogTitle>
          <DialogDescription>
            Tạo bảng lương cho tất cả nhân viên theo kỳ hạn trả lương
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Phạm vi áp dụng */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Phạm vi áp dụng</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="scope-all" />
                        <label
                          htmlFor="scope-all"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Tất cả nhân viên
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="scope-single" />
                        <label
                          htmlFor="scope-single"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Tùy chọn
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="month">Kỳ làm việc</Label>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tháng" />
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
                    <FormItem className="w-[140px]">
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn năm" />
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

            {/* Tùy chọn - Chỉ hiện khi scope === "single" */}
            {scope === "single" && (
              <>
                {/* Staff Picker */}
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
                              aria-expanded={staffSearchOpen}
                              className="w-full justify-between"
                            >
                              {selectedStaff ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">
                                    {selectedStaff.code}
                                  </span>
                                  <span>{selectedStaff.fullName}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  Chọn nhân viên...
                                </span>
                              )}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm theo mã hoặc tên nhân viên..." />
                            <CommandList>
                              {isLoadingStaffs ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : staffList?.length === 0 ? (
                                <CommandEmpty>
                                  Không tìm thấy nhân viên
                                </CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {staffList?.map((staff: any) => (
                                    <CommandItem
                                      key={staff.id}
                                      value={`${staff.code}-${staff.fullName}`}
                                      onSelect={() => {
                                        field.onChange(staff.id);
                                        setStaffSearchOpen(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                          <span className="text-xs font-medium">
                                            {staff.fullName?.charAt(0) || "?"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {staff.fullName}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-mono">
                                            {staff.code}
                                          </span>
                                        </div>
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

                {/* Lương cơ bản */}
                <FormField
                  control={form.control}
                  name="baseSalaryFullMonth"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>
                        Lương cơ bản (tháng đủ){" "}
                        <span className="text-xs text-muted-foreground">
                          (không bắt buộc)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="0"
                            {...field}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            VNĐ
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGeneratingAll || isGeneratingSingle}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isGeneratingAll || isGeneratingSingle}
          >
            {(isGeneratingAll || isGeneratingSingle) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Tạo bảng lương
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
