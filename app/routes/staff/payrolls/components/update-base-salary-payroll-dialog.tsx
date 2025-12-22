import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, User } from "lucide-react";
import { useEffect } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { formatMoney } from "~/lib/utils";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";
import { useUpdateBaseSalaryPayroll } from "../container/query.hooks";

type UpdatePayrollFormData = z.infer<
  typeof StaffPayrollSchema.UpdateBaseSalaryPayrollSchema
>;

interface UpdatePayrollDialogProps {
  payroll: PayrollItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UpdateBaseSalaryPayrollDialog({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: UpdatePayrollDialogProps) {
  const form = useForm<UpdatePayrollFormData>({
    resolver: zodResolver(StaffPayrollSchema.UpdateBaseSalaryPayrollSchema),
    defaultValues: {
      baseSalaryFullMonth: payroll?.baseSalaryFullMonth,
    },
  });

  // Load initial values when payroll changes
  useEffect(() => {
    if (payroll) {
      form.reset({
        baseSalaryFullMonth: payroll.baseSalaryFullMonth,
      });
    }
  }, [payroll, form]);

  const { mutate: updatePayroll, isPending } = useUpdateBaseSalaryPayroll();

  const handleSubmit = form.handleSubmit((data) => {
    if (!payroll) return;

    const payload: any = {};
    if (data.baseSalaryFullMonth) {
      if (!isNaN(data.baseSalaryFullMonth)) {
        payload.baseSalaryFullMonth = data.baseSalaryFullMonth;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden outline-none">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-lg">Cập nhật lương cơ bản</DialogTitle>
          <DialogDescription>
            Điều chỉnh mức lương áp dụng cho kỳ hiện tại.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="update-salary-form"
            onSubmit={handleSubmit}
            className="px-6 py-6 space-y-6"
          >
            {/* Context Card: Who are we editing? */}
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-card shadow-sm">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-foreground">
                  {payroll?.staffName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                  <span className="bg-muted px-1.5 py-0.5 rounded">
                    {payroll?.staffCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Salary Input Field */}
            <FormField
              control={form.control}
              name="baseSalaryFullMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                    Mức lương mới (Tháng)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.currentTarget.valueAsNumber)
                        }
                        type="number" // Use text to allow formatting
                        className="font-mono text-lg font-medium"
                        endAddon={
                          <div className="text-muted-foreground">
                            <span className="text-xs font-medium">VND</span>
                          </div>
                        }
                      />
                    </div>
                  </FormControl>

                  <FormDescription className="text-xs italic text-right">
                    Số tiền: {formatMoney(field.value || 0).vndFormatted} VND
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            // Link button to form ID so it submits even outside the <form> tag
            form="update-salary-form"
            type="submit"
            disabled={isPending || !form.formState.isDirty}
            className="min-w-[120px]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
