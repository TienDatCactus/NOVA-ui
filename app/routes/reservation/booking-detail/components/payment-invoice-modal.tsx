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
import type { UseFormReturn } from "react-hook-form";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import { formatMoney } from "~/lib/utils";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "~/services/types/payment.types";

interface PaymentInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
}

export default function PaymentInvoiceModal({
  open,
  onOpenChange,
  form,
}: PaymentInvoiceModalProps) {
  const totalAmount = form.watch("totalAmount") || 0;
  const paidAmount = form.watch("paidAmount") || 0;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thanh toán & Hóa đơn</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thanh toán và trạng thái hóa đơn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            Thông tin thanh toán
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức thanh toán</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Trạng thái hóa đơn</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn trạng thái hóa đơn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVOICE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Total Amount */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng tiền</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value
                      ? formatMoney(Number(field.value)).vndFormatted
                      : "Nhập tổng tiền"}
                  </FormDescription>
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
                  <FormLabel>Đã thanh toán</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value
                      ? formatMoney(Number(field.value)).vndFormatted
                      : "Nhập số tiền đã trả"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Remaining Amount Display */}
          {totalAmount > 0 && (
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Còn lại:</span>
                <span
                  className={`text-lg font-bold ${
                    remainingAmount > 0 ? "text-destructive" : "text-success"
                  }`}
                >
                  {formatMoney(remainingAmount).vndFormatted}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => onOpenChange(false)}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
