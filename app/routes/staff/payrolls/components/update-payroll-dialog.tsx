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
import { formatMoney } from "~/lib/utils";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { useUpdatePayroll } from "../container/query.hooks";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";
import { ButtonGroup } from "~/components/ui/button-group";

type UpdatePayrollFormData = z.infer<
  typeof StaffPayrollSchema.UpdatePayrollSchema
>;

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
    resolver: zodResolver(StaffPayrollSchema.UpdatePayrollSchema),
    defaultValues: {
      baseSalaryFullMonth: payroll?.baseSalaryFullMonth,
      paidAmount: payroll?.paidAmount,
    },
  });

  // Load initial values when payroll changes
  useEffect(() => {
    if (payroll) {
      form.reset({
        baseSalaryFullMonth: payroll.baseSalaryFullMonth,
        paidAmount: payroll.paidAmount,
      });
    }
  }, [payroll, form]);

  const { mutate: updatePayroll, isPending } = useUpdatePayroll();

  const handleSubmit = form.handleSubmit((data) => {
    if (!payroll) return;

    const payload: any = {};
    if (data.baseSalaryFullMonth) {
      if (!isNaN(data.baseSalaryFullMonth)) {
        payload.baseSalaryFullMonth = data.baseSalaryFullMonth;
      }
    }
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
      }
    );
  });

  const watchedPaidAmount = form.watch("paidAmount") || 0;
  const projectedRemaining =
    Number(payroll?.totalAmount) - Number(watchedPaidAmount);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <DialogTitle>Cập nhật bảng lương</DialogTitle>
          <DialogDescription className="mt-0.5">
            Điều chỉnh thông tin lương cho kỳ hiện tại.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Staff Card */}
            <div className="flex items-center gap-4 p-3 rounded-xl border bg-card shadow-sm">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {payroll?.staffName}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {payroll?.staffCode}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="baseSalaryFullMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                      Lương cơ bản (Tháng)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className=" font-mono font-medium"
                        onChange={(e) =>
                          field.onChange(e.currentTarget.valueAsNumber)
                        }
                        startAddon={
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        }
                        endAddon={
                          <span className=" text-xs font-medium text-muted-foreground">
                            VND
                          </span>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Paid Amount Input */}
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                        Đã thanh toán
                      </FormLabel>{" "}
                      <div className="flex justify-end">
                        <ButtonGroup>
                          <Button
                            size={"sm"}
                            variant="outline"
                            onClick={() =>
                              form.setValue(
                                "paidAmount",
                                ((form.watch("baseSalaryFullMonth") ?? 0) *
                                  50) /
                                  100
                              )
                            }
                          >
                            50%
                          </Button>
                          <Button
                            size={"sm"}
                            variant="outline"
                            onClick={() =>
                              form.setValue(
                                "paidAmount",
                                ((form.watch("baseSalaryFullMonth") ?? 0) *
                                  100) /
                                  100
                              )
                            }
                          >
                            100%
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="font-mono font-medium text-emerald-600"
                        onChange={(e) =>
                          field.onChange(e.currentTarget.valueAsNumber)
                        }
                        startAddon={
                          <DollarSign className="h-4 w-4 text-emerald-600/50" />
                        }
                        endAddon={
                          <span className="text-xs font-medium text-muted-foreground">
                            VND
                          </span>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Summary Preview */}
            <div className="rounded-lg bg-muted border border-muted p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Calculator className="h-4 w-4" />
                <span>Tạm tính</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng lương:</span>
                <span className="font-mono font-medium">
                  {formatMoney(payroll?.totalAmount || 0).vndFormatted}
                </span>
              </div>

              <Separator className="bg-slate-200" />

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold text-muted-foreground">
                  Còn lại:
                </span>
                <span
                  className={`font-mono text-lg font-bold ${projectedRemaining < 0 ? "text-red-600" : "text-muted-foreground  "}`}
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
            onClick={handleSubmit}
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
