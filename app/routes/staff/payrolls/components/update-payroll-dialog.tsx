import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";

import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";

const updatePayrollSchema = z.object({
  baseSalaryFullMonth: z.string().optional(),
  paidAmount: z.string().optional(),
});

type UpdatePayrollFormData = z.infer<typeof updatePayrollSchema>;

interface UpdatePayrollDialogProps {
  payroll: PayrollItemDto | null;
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
  const form = useForm<UpdatePayrollFormData>({
    resolver: zodResolver(updatePayrollSchema),
    defaultValues: {
      baseSalaryFullMonth: "",
      paidAmount: "",
    },
  });

  // Load initial values when payroll changes
  useEffect(() => {
    if (payroll) {
      form.reset({
        baseSalaryFullMonth: payroll.baseSalaryFullMonth
          ? payroll.baseSalaryFullMonth.toString()
          : "",
        paidAmount: payroll.paidAmount ? payroll.paidAmount.toString() : "",
      });
    }
  }, [payroll, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePayrollFormData) => {
      if (!payroll) throw new Error("Không có dữ liệu bảng lương");

      const updateData: {
        baseSalaryFullMonth?: number;
        paidAmount?: number;
      } = {};

      if (data.baseSalaryFullMonth) {
        const parsed = parseFloat(data.baseSalaryFullMonth);
        if (!isNaN(parsed)) {
          updateData.baseSalaryFullMonth = parsed;
        }
      }
      if (data.paidAmount) {
        const parsed = parseFloat(data.paidAmount);
        if (!isNaN(parsed)) {
          updateData.paidAmount = parsed;
        }
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

  const handleSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data);
  });

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

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Staff Info */}
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mã nhân viên:</span>
                <span className="font-mono font-medium">
                  {payroll?.staffCode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tên nhân viên:</span>
                <span className="font-medium">{payroll?.staffName}</span>
              </div>
            </div>

            {/* Base Salary Full Month */}
            <FormField
              control={form.control}
              name="baseSalaryFullMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lương cơ bản (Tháng đủ)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="text"
                        placeholder="Nhập lương cơ bản"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        VNĐ
                      </span>
                    </div>
                  </FormControl>
                  {payroll && (
                    <p className="text-xs text-muted-foreground">
                      Hiện tại: {payroll.baseSalaryFullMonth.toLocaleString()}{" "}
                      VNĐ
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paid Amount */}
            <FormField
              control={form.control}
              name="paidAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền đã trả</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="text"
                        placeholder="Nhập số tiền đã trả"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        VNĐ
                      </span>
                    </div>
                  </FormControl>
                  {payroll && (
                    <p className="text-xs text-muted-foreground">
                      Hiện tại: {payroll.paidAmount.toLocaleString()} VNĐ
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {payroll && (
              <div className="rounded-lg border bg-card p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng lương:</span>
                  <span className="font-mono font-semibold">
                    {payroll.totalAmount.toLocaleString()} VNĐ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Còn lại:</span>
                  <span className="font-mono font-semibold text-orange-600">
                    {payroll.remainingAmount.toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            )}
          </form>
        </Form>

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
