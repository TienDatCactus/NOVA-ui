import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "~/components/ui/select";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import type { InvoicePaymentRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";

type InvoicePaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InvoicePaymentRequestDto) => void;
  remaining: number;
};

export function InvoicePaymentDialog({
  open,
  onClose,
  onSubmit,
  remaining,
}: InvoicePaymentDialogProps) {
  const form = useForm<InvoicePaymentRequestDto>({
    resolver: zodResolver(InvoiceSchema.InvoicePaymentRequestSchema) as any,
    defaultValues: {
      method: "",
      amount: remaining,
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ method: "", amount: remaining, note: "" });
    }
  }, [open, remaining, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card shadow-sm  p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Thanh toán hóa đơn
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                method: values.method,
                amount: values.amount,
                note: values.note ?? "",
              })
            )}
          >
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-40">
                        Phương thức thanh toán
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <method.icon /> {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Chọn phương thức thanh toán cho hóa đơn này.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
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
                    Nhập số tiền thanh toán (tối thiểu 1).
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
            <DialogFooter className="flex flex-row gap-4 justify-end pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
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
