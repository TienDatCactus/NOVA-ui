import { useState, useEffect } from "react";
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
import { Input } from "~/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff-payroll";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { PayrollItem } from "~/services/api/staff-payroll/dto";
import {
  formatNumber,
  parseFormattedNumber,
  handleNumberInputChange,
} from "~/lib/format-number";

interface UpdatePayrollDialogProps {
  payroll: PayrollItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UpdatePayrollDialog({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: UpdatePayrollDialogProps) {
  const [baseSalaryFullMonth, setBaseSalaryFullMonth] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");

  // Load initial values when payroll changes
  useEffect(() => {
    if (payroll) {
      setBaseSalaryFullMonth(
        payroll.baseSalaryFullMonth ? formatNumber(payroll.baseSalaryFullMonth) : ""
      );
      setPaidAmount(
        payroll.paidAmount ? formatNumber(payroll.paidAmount) : ""
      );
    }
  }, [payroll]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!payroll) throw new Error("Không có dữ liệu bảng lương");

      const updateData: {
        baseSalaryFullMonth?: number;
        paidAmount?: number;
      } = {};

      if (baseSalaryFullMonth) {
        updateData.baseSalaryFullMonth = parseFormattedNumber(baseSalaryFullMonth);
      }
      if (paidAmount) {
        updateData.paidAmount = parseFormattedNumber(paidAmount);
      }

      return StaffPayrollService.updatePayroll(payroll.payrollId, updateData);
    },
    onSuccess: () => {
      toast.success("Cập nhật bảng lương thành công");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật bảng lương");
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật bảng lương</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin lương cơ bản và số tiền đã trả cho nhân viên{" "}
            {payroll?.staffName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Staff Info */}
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã nhân viên:</span>
              <span className="font-mono font-medium">{payroll?.staffCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tên nhân viên:</span>
              <span className="font-medium">{payroll?.staffName}</span>
            </div>
          </div>

          {/* Base Salary Full Month */}
          <div className="space-y-2">
            <Label htmlFor="baseSalary">Lương cơ bản (Tháng đủ)</Label>
            <div className="relative">
              <Input
                id="baseSalary"
                type="text"
                placeholder="Nhập lương cơ bản"
                value={baseSalaryFullMonth}
                onChange={(e) => handleNumberInputChange(e, setBaseSalaryFullMonth)}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                VNĐ
              </span>
            </div>
            {payroll && (
              <p className="text-xs text-muted-foreground">
                Hiện tại: {formatNumber(payroll.baseSalaryFullMonth)} VNĐ
              </p>
            )}
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Số tiền đã trả</Label>
            <div className="relative">
              <Input
                id="paidAmount"
                type="text"
                placeholder="Nhập số tiền đã trả"
                value={paidAmount}
                onChange={(e) => handleNumberInputChange(e, setPaidAmount)}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                VNĐ
              </span>
            </div>
            {payroll && (
              <p className="text-xs text-muted-foreground">
                Hiện tại: {formatNumber(payroll.paidAmount)} VNĐ
              </p>
            )}
          </div>

          {/* Summary */}
          {payroll && (
            <div className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng lương:</span>
                <span className="font-mono font-semibold">
                  {formatNumber(payroll.totalAmount)} VNĐ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Còn lại:</span>
                <span className="font-mono font-semibold text-orange-600">
                  {formatNumber(payroll.remainingAmount)} VNĐ
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !payroll}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
