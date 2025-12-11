import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { RefundInvoiceRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import { Undo2, Banknote, AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn, formatMoney } from "~/lib/utils";

type RefundDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RefundInvoiceRequestDto) => void;
  maxRefundAmount: number;
};

export function RefundDialog({
  open,
  onClose,
  onSubmit,
  maxRefundAmount,
}: RefundDialogProps) {
  const form = useForm<RefundInvoiceRequestDto>({
    resolver: zodResolver(InvoiceSchema.RefundInvoiceRequestSchema),
    defaultValues: {
      reason: "",
      refundAmount: 0,
    },
    mode: "onChange", // Validate ngay khi gõ để báo lỗi vượt quá số tiền
  });

  useEffect(() => {
    if (open) {
      form.reset({ reason: "", refundAmount: 0 });
    }
  }, [open, form]);

  // Helper set max amount
  const handleSetMaxAmount = () => {
    form.setValue("refundAmount", maxRefundAmount, { shouldValidate: true });
  };

  const currentAmount = form.watch("refundAmount");
  const isOverLimit = currentAmount > maxRefundAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card shadow-lg p-0 gap-0 max-w-md w-full overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
              <Undo2 className="w-5 h-5" />
            </div>
            Hoàn tiền hóa đơn
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <div className="p-6 space-y-6">
              {/* INFO CARD */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <span className="font-semibold block mb-0.5">Lưu ý:</span>
                  Số tiền hoàn tối đa cho hóa đơn này là{" "}
                  <span className="font-mono font-bold">
                    {formatMoney(maxRefundAmount).vndFormatted}
                  </span>
                  .
                </div>
              </div>

              {/* AMOUNT FIELD */}
              <FormField
                control={form.control}
                name="refundAmount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Số tiền hoàn</FormLabel>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 hover:text-primary active:scale-95 transition-all"
                        onClick={handleSetMaxAmount}
                      >
                        Hoàn tất cả: {formatMoney(maxRefundAmount).vndFormatted}
                      </Badge>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min={0}
                          max={maxRefundAmount}
                          placeholder="0"
                          className={cn(
                            "pl-9 pr-12 font-mono text-lg font-semibold",
                            isOverLimit &&
                              "border-destructive focus-visible:ring-destructive text-destructive"
                          )}
                          {...field}
                          value={field.value === 0 ? "" : field.value} // UX: Không hiện số 0 mặc định để placeholder hiện ra
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                          VND
                        </span>
                      </div>
                    </FormControl>
                    {isOverLimit && (
                      <p className="text-xs text-destructive font-medium mt-1 animate-in slide-in-from-top-1">
                        Số tiền hoàn không được vượt quá{" "}
                        {formatMoney(maxRefundAmount).vndFormatted}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* REASON FIELD */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lý do hoàn tiền{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: Khách hàng hủy dịch vụ, Sai sót khi tính tiền..."
                        className="bg-background min-h-[100px] resize-none"
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
                disabled={
                  !form.formState.isValid || isOverLimit || currentAmount <= 0
                }
                className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
              >
                Xác nhận hoàn
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
