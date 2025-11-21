import { useState } from "react";
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
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import { StaffService } from "~/services/api/staff/staff";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
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
  formatNumber,
  parseFormattedNumber,
  handleNumberInputChange,
} from "~/lib/format-number";

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function GeneratePayrollDialog({
  open,
  onOpenChange,
  onSuccess,
}: GeneratePayrollDialogProps) {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [scope, setScope] = useState<"all" | "single">("all");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [baseSalaryFullMonth, setBaseSalaryFullMonth] = useState<string>("");
  const [staffSearchOpen, setStaffSearchOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");

  // Fetch staff list
  const { data: staffListData, isPending: isLoadingStaffs } = useQuery({
    queryKey: ["staffs-list"],
    queryFn: () => StaffService.getStaffList(),
    enabled: open && scope === "single",
  });

  const staffList = (staffListData as any)?.data || [];

  const filteredStaffs = staffList.filter(
    (staff: any) =>
      staff.fullName?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      staff.code?.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

  const selectedStaff = staffList.find((s: any) => s.id === selectedStaffId);

  const generateMutation = useMutation({
    mutationFn: () => {
      if (scope === "all") {
        return StaffPayrollService.generatePayroll({
          year,
          month,
        });
      } else {
        if (!selectedStaffId) {
          throw new Error("Vui lòng chọn nhân viên");
        }
        const payload: any = {
          year,
          month,
        };
        // Chỉ gửi baseSalaryFullMonth nếu có giá trị
        if (baseSalaryFullMonth) {
          const parsedValue = parseFormattedNumber(baseSalaryFullMonth);
          if (parsedValue > 0) {
            payload.baseSalaryFullMonth = parsedValue;
          }
        }
        return StaffPayrollService.generateSinglePayroll(
          selectedStaffId,
          payload
        );
      }
    },
    onSuccess: () => {
      toast.success(
        scope === "all"
          ? "Tạo bảng lương thành công cho tất cả nhân viên"
          : "Tạo bảng lương thành công cho nhân viên"
      );
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo bảng lương");
    },
  });

  const handleSubmit = () => {
    generateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo bảng lương</DialogTitle>
          <DialogDescription>
            Tạo bảng lương cho tất cả nhân viên theo kỳ hạn trả lương
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phạm vi áp dụng */}
          <div className="space-y-3">
            <Label>Phạm vi áp dụng</Label>
            <RadioGroup
              value={scope}
              onValueChange={(value: any) => setScope(value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Kỳ làm việc</Label>
            <div className="flex gap-2">
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={year.toString()}
                onValueChange={(value) => setYear(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
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
            </div>
          </div>

          {/* Tùy chọn - Chỉ hiện khi scope === "single" */}
          {scope === "single" && (
            <>
              {/* Staff Picker */}
              <div className="space-y-2">
                <Label>Chọn nhân viên</Label>
                <Popover
                  open={staffSearchOpen}
                  onOpenChange={setStaffSearchOpen}
                >
                  <PopoverTrigger asChild>
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
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Tìm theo mã hoặc tên nhân viên..."
                        value={staffSearchQuery}
                        onValueChange={setStaffSearchQuery}
                      />
                      <CommandList>
                        {isLoadingStaffs ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : filteredStaffs.length === 0 ? (
                          <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredStaffs.map((staff: any) => (
                              <CommandItem
                                key={staff.id}
                                value={`${staff.code}-${staff.fullName}`}
                                onSelect={() => {
                                  setSelectedStaffId(staff.id);
                                  setStaffSearchQuery("");
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
              </div>

              {/* Lương cơ bản */}
              <div className="space-y-2">
                <Label htmlFor="baseSalary">
                  Lương cơ bản (tháng đủ){" "}
                  <span className="text-xs text-muted-foreground">
                    (không bắt buộc)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="baseSalary"
                    type="text"
                    placeholder="0"
                    value={baseSalaryFullMonth}
                    onChange={(e) =>
                      handleNumberInputChange(e, setBaseSalaryFullMonth)
                    }
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    VNĐ
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              generateMutation.isPending ||
              (scope === "single" && !selectedStaffId)
            }
          >
            {generateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Tạo bảng lương
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
