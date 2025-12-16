import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Banknote } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
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
import { cn, formatMoney } from "~/lib/utils";
import type { RefundInvoiceRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

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
      <DialogContent className="bg-background shadow-lg p-0 gap-0 max-w-md w-full overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-card ">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
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
              <Alert variant={"warning"}>
                <AlertCircle />
                <AlertTitle>Lưu ý:</AlertTitle>
                <AlertDescription>
                  Số tiền hoàn tối đa cho hóa đơn này là{" "}
                  <span className="font-mono font-bold">
                    {formatMoney(maxRefundAmount).vndFormatted}
                  </span>
                </AlertDescription>
              </Alert>

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
                      <Input
                        type="number"
                        startAddon={
                          <Banknote className="h-4 w-4 text-muted-foreground" />
                        }
                        endAddon={
                          <span className="text-sm text-muted-foreground font-medium">
                            VND
                          </span>
                        }
                        min={0}
                        max={maxRefundAmount}
                        placeholder="0"
                        className={cn(
                          isOverLimit &&
                            "border-destructive focus-visible:ring-destructive text-destructive"
                        )}
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
