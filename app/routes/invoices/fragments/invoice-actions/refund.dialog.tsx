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
import { Textarea } from "~/components/ui/textarea";
import type { RefundInvoiceRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

type RefundDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RefundInvoiceRequestDto) => void;
};

export function RefundDialog({ open, onClose, onSubmit }: RefundDialogProps) {
  const form = useForm<RefundInvoiceRequestDto>({
    resolver: zodResolver(InvoiceSchema.RefundInvoiceRequestSchema) as any,
    defaultValues: {
      reason: "",
      refundAmount: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ reason: "", refundAmount: 0 });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card shadow-sm  p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Hoàn tiền
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
          >
            <FormField
              control={form.control}
              name="refundAmount"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Số tiền hoàn"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Nhập số tiền cần hoàn lại cho khách hàng.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Textarea
                      placeholder="Lý do"
                      className="bg-background text-foreground placeholder:text-muted-foreground min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Vui lòng nhập lý do hoàn tiền (bắt buộc).
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
