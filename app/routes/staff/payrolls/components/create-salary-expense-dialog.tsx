import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Loader2, Receipt } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";
import { useCreateSalaryExpense } from "../container/query.hooks";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { formatMoney } from "~/lib/utils";

const { CreateSalaryExpenseRequestSchema } = StaffPayrollSchema;

type CreateSalaryExpenseFormData = z.infer<
  typeof CreateSalaryExpenseRequestSchema
>;

interface CreateSalaryExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollItemDto;
}

export default function CreateSalaryExpenseDialog({
  open,
  onOpenChange,
  payroll,
}: CreateSalaryExpenseDialogProps) {
  const { mutate: createExpense, isPending } = useCreateSalaryExpense();

  const form = useForm<CreateSalaryExpenseFormData>({
    resolver: zodResolver(CreateSalaryExpenseRequestSchema),
    defaultValues: {
      paymentMethod: "Cash",
      receiptNumber: "",
    },
  });

  const handleSubmit = (data: CreateSalaryExpenseFormData) => {
    createExpense(
      { payrollId: payroll.payrollId, data },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tạo phiếu chi lương
          </DialogTitle>
          <DialogDescription>
            Tạo phiếu chi lương cho nhân viên {payroll.staffName} (
            {payroll.staffCode})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Payroll Information */}
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng lương:</span>
                <span className="font-semibold">
                  {formatMoney(payroll.totalAmount || 0).vndFormatted}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã trả:</span>
                <span className="font-semibold text-green-600">
                  {formatMoney(payroll.paidAmount).vndFormatted}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Còn lại:</span>
                <span className="font-bold text-primary">
                  {formatMoney(payroll.remainingAmount).vndFormatted}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Tiền mặt</SelectItem>
                      <SelectItem value="BankTransfer">Chuyển khoản</SelectItem>
                      <SelectItem value="MoMo">MoMo</SelectItem>
                      <SelectItem value="ZaloPay">ZaloPay</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt Number */}
            <FormField
              control={form.control}
              name="receiptNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số phiếu chi</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Nhập số phiếu chi"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Số phiếu chi từ hệ thống kế toán
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo phiếu chi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
