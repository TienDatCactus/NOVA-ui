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
import { useMutation } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { PayrollItem } from "~/services/api/staff/staff-payroll/dto";

interface ApplyUnusedLeaveDialogProps {
  payroll: PayrollItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ApplyUnusedLeaveDialog({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: ApplyUnusedLeaveDialogProps) {
  const [mode, setMode] = useState<"PayOut" | "CarryOver">("PayOut");

  const applyMutation = useMutation({
    mutationFn: () =>
      StaffPayrollService.applyUnusedLeave(payroll.payrollId, { mode }),
    onSuccess: () => {
      toast.success("Áp dụng chế độ xử lý phép dư thành công");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra");
    },
  });

  const handleSubmit = () => {
    applyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Áp dụng chế độ xử lý phép dư</DialogTitle>
          <DialogDescription>
            Nhân viên <strong>{payroll.staffName}</strong> còn{" "}
            <strong>{payroll.paidLeaveDaysRemaining} ngày phép</strong> chưa sử
            dụng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Chọn chế độ xử lý</Label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chế độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PayOut">Trả tiền phép dư</SelectItem>
                <SelectItem value="CarryOver">
                  Cộng dồn sang tháng sau
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Description hiện khi select */}
            {mode === "PayOut" && (
              <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                Quy đổi ngày phép thành tiền
              </p>
            )}
            {mode === "CarryOver" && (
              <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                Giữ lại cho kỳ tiếp theo
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nhân viên:</span>
              <span className="font-medium">{payroll.staffName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã NV:</span>
              <span className="font-mono">{payroll.staffCode}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={applyMutation.isPending}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={applyMutation.isPending}>
            {applyMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Áp dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
