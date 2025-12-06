import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import type { InvoicePaymentRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { Badge } from "~/components/ui/badge";
import { Wallet, Banknote, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

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
    resolver: zodResolver(InvoiceSchema.InvoicePaymentRequestSchema),
    defaultValues: {
      method: "",
      amount: remaining,
      note: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({ method: "", amount: remaining, note: "" });
    }
  }, [open, remaining, form]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const currentAmount = form.watch("amount");
  const isOverPay = currentAmount > remaining;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card p-0 gap-0 max-w-md w-full overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
              <Wallet className="w-5 h-5" />
            </div>
            Thanh toán hóa đơn
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                method: values.method,
                amount: values.amount,
                note: values.note ?? "",
              })
            )}
          >
            <div className="p-6 space-y-6">
              {/* BALANCE INFO CARD */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <span className="font-semibold block mb-0.5">
                    Số tiền cần thanh toán:
                  </span>
                  Khách hàng còn nợ{" "}
                  <span className="font-mono font-bold text-base">
                    {formatCurrency(remaining)}
                  </span>
                  .
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phương thức thanh toán{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Chọn phương thức..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              {/* Nếu method.icon là component, render nó */}
                              {method.icon && (
                                <method.icon className="w-4 h-4 text-muted-foreground" />
                              )}
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AMOUNT */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Số tiền thu</FormLabel>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-emerald-100 hover:text-emerald-700 font-normal transition-colors"
                        onClick={() =>
                          form.setValue("amount", remaining, {
                            shouldValidate: true,
                          })
                        }
                      >
                        Thu đủ: {formatCurrency(remaining)}
                      </Badge>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min={1}
                          placeholder="0"
                          className={cn(
                            "pl-9 pr-12 font-mono text-lg font-semibold",
                            isOverPay &&
                              "border-destructive text-destructive focus-visible:ring-destructive"
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                          VND
                        </span>
                      </div>
                    </FormControl>
                    {isOverPay && (
                      <p className="text-xs text-destructive font-medium mt-1 animate-in slide-in-from-top-1">
                        Số tiền thu không được vượt quá số nợ còn lại.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NOTE */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: Mã giao dịch ngân hàng, người nộp tiền..."
                        className="bg-background min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/5 gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                disabled={!form.formState.isValid || isOverPay}
              >
                <span className="flex items-center gap-2">
                  Xác nhận thu <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
