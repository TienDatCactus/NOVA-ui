import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, DollarSign, Loader2, User } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "react-aria-components";
import { useForm } from "react-hook-form";
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
import { cn, formatMoney } from "~/lib/utils";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";
import { useUpdatePaidAmountPayroll } from "../container/query.hooks";

type UpdatePayrollFormData = z.infer<
  typeof StaffPayrollSchema.UpdatePaidAmountPayrollSchema
>;

interface UpdatePayrollDialogProps {
  payroll: PayrollItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UpdatePaidAmountPayrollDialog({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: UpdatePayrollDialogProps) {
  const form = useForm<UpdatePayrollFormData>({
    resolver: zodResolver(StaffPayrollSchema.UpdatePaidAmountPayrollSchema),
    defaultValues: {
      paidAmount: payroll?.paidAmount,
    },
  });

  // Load initial values when payroll changes
  useEffect(() => {
    if (payroll) {
      form.reset({
        paidAmount: payroll.paidAmount,
      });
    }
  }, [payroll, form]);

  const { mutate: updatePayroll, isPending } = useUpdatePaidAmountPayroll();

  const handleSubmit = form.handleSubmit((data) => {
    if (!payroll) return;

    const payload: any = {};

    if (data.paidAmount) {
      if (!isNaN(data.paidAmount)) {
        payload.paidAmount = data.paidAmount;
      }
    }

    updatePayroll(
      {
        id: payroll.payrollId,
        data: payload,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onOpenChange(false);
        },
      },
    );
  });

  const watchedPaidAmount = form.watch("paidAmount") || 0;
  const projectedRemaining =
    Number(payroll?.totalAmount) - Number(watchedPaidAmount);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle>Cập nhật số tiền đã trả</DialogTitle>
          <DialogDescription>
            Điều chỉnh số tiền thực trả cho kỳ lương này.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="payroll-update-form"
            onSubmit={handleSubmit}
            className="px-6 py-6 space-y-6"
          >
            <div className="flex items-center gap-4 p-3 rounded-xl border bg-card/50 shadow-sm">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {payroll?.staffName || "Không xác định"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {payroll?.staffCode || "---"}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="paidAmount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-end mb-2">
                    <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                      Số tiền thanh toán
                    </FormLabel>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() =>
                        form.setValue(
                          "paidAmount",
                          Math.round(((payroll?.totalAmount || 0) * 100) / 100),
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                          },
                        )
                      }
                    >
                      100%
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      {/* Thêm overlay icon để đẹp hơn addon mặc định */}
                      <div className="absolute left-3 top-2.5 text-emerald-600">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="font-mono font-medium text-emerald-600 text-base"
                        endAddon={
                          <div className=" text-xs font-medium text-muted-foreground">
                            VND
                          </div>
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? 0 : Number(val));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary Preview */}
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-3 dark:bg-muted/20 dark:border-muted">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Calculator className="h-4 w-4" />
                <span>Tạm tính</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng lương:</span>
                <span className="font-mono font-medium">
                  {formatMoney(payroll?.totalAmount || 0).vndFormatted}
                </span>
              </div>

              {/* Dùng border style dash để tạo cảm giác hóa đơn */}
              <Separator className="bg-slate-200 border-dashed" />

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold text-muted-foreground">
                  Còn lại:
                </span>
                <span
                  className={cn(
                    "font-mono text-lg font-bold transition-colors",
                    projectedRemaining < 0
                      ? "text-red-500"
                      : "text-slate-700 dark:text-slate-200",
                    projectedRemaining === 0 && "text-emerald-600", // Hết nợ thì xanh
                  )}
                >
                  {formatMoney(projectedRemaining).vndFormatted}
                </span>
              </div>
            </div>
          </form>
        </Form>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/5 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="payroll-update-form" // Magic: Link button này với form ở trên
            disabled={isPending}
            className="min-w-[100px]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
