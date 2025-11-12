import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { ConfirmInvoicePaymentRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: (data: ConfirmInvoicePaymentRequestDto) => void;
  onCancel: () => void;
};

export function ConfirmPaymentDialog({
  open,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const form = useForm<ConfirmInvoicePaymentRequestDto>({
    resolver: zodResolver(
      InvoiceSchema.ConfirmInvoicePaymentRequestSchema
    ) as any,
    defaultValues: {
      amount: 0,
      paymentMethod: "",
      transactionReference: "",
      note: "",
      paidAt: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        paymentMethod: "",
        transactionReference: "",
        note: "",
        paidAt: new Date().toISOString().slice(0, 16),
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-card shadow-sm  p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Xác nhận thanh toán
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => onConfirm(values))}
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Số tiền"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Nhập số tiền xác nhận thanh toán (bắt buộc).
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>Phương thức thanh toán</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                        <SelectItem value="card">Thẻ</SelectItem>
                        <SelectItem value="transfer">Chuyển khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Chọn phương thức thanh toán.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="transactionReference"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      placeholder="Mã giao dịch"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Nhập mã giao dịch thanh toán (bắt buộc).
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú"
                      className="bg-background text-foreground placeholder:text-muted-foreground min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    (Tùy chọn) Thêm ghi chú cho thanh toán này.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Thời gian xác nhận thanh toán.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <DialogFooter className="flex flex-row gap-4 justify-end pt-4">
              <Button variant="outline" type="button" onClick={onCancel}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={!form.formState.isValid}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
