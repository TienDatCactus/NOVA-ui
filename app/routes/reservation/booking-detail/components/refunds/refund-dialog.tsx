import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
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
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";
import type { CreateRefundForBookingRequestDto } from "~/services/api/refunds/dto";
import { RefundsSchemas } from "~/services/api/refunds/refunds.schema";
import { useCreateRefund } from "../../container/use-refund.hooks";
import { PAYMENT_METHODS } from "~/services/types/payment.types";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingNumber: string;
  totalPaidAmount: number;
  bookingStatus: string;
}

export default function RefundDialog({
  open,
  onOpenChange,
  bookingId,
  bookingNumber,
  totalPaidAmount,
  bookingStatus,
}: RefundDialogProps) {
  const { mutate: createRefund, isPending } = useCreateRefund(bookingId);

  const form = useForm({
    resolver: zodResolver(RefundsSchemas.CreateRefundForBookingRequestSchema),
    defaultValues: {
      refundAmount: 0,
      refundMethod: "Cash" as const,
      note: "",
      originalPaymentId: undefined,
    },
  });

  const refundAmount = form.watch("refundAmount");

  useEffect(() => {
    if (open) {
      form.reset({
        refundAmount: 0,
        refundMethod: "Cash",
        note: "",
        originalPaymentId: undefined,
      });
    }
  }, [open, form]);

  const handleSubmit = (data: CreateRefundForBookingRequestDto) => {
    // Final validation
    if (bookingStatus === "CheckedOut") {
      form.setError("refundAmount", {
        message: "Không thể hoàn tiền cho booking đã checkout",
      });
      return;
    }

    if (data.refundAmount > totalPaidAmount) {
      form.setError("refundAmount", {
        message: `Số tiền hoàn không được vượt quá ${formatMoney(totalPaidAmount).vndFormatted}`,
      });
      return;
    }

    createRefund(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  const handleRefundAll = () => {
    form.setValue("refundAmount", totalPaidAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hoàn tiền cho Booking</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Số booking:{" "}
            <Badge variant="outline" className="font-mono">
              {bookingNumber}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Reference Information */}
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tổng đã thanh toán:
                </span>
                <span className="font-semibold font-mono">
                  {formatMoney(totalPaidAmount).vndFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Có thể hoàn tối đa:
                </span>
                <span className="font-bold text-primary font-mono">
                  {formatMoney(totalPaidAmount).vndFormatted}
                </span>
              </div>
            </div>

            {/* Refund Amount */}
            <FormField
              control={form.control}
              name="refundAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số tiền hoàn <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền cần hoàn"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRefundAll}
                      className="whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Hoàn toàn bộ
                    </Button>
                  </div>
                  <FormDescription>
                    {refundAmount > 0 && (
                      <span className="text-primary font-medium">
                        Sẽ hoàn: {formatMoney(refundAmount).vndFormatted}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Method */}
            <FormField
              control={form.control}
              name="refundMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phương thức hoàn tiền{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHODS.filter(
                        (pm) =>
                          pm.value !== "OTACollect" && pm.value !== "OTAPrepaid"
                      ).map((pm) => (
                        <SelectItem key={pm.value} value={pm.value}>
                          <div className="flex items-center gap-2">
                            <pm.icon className="w-4 h-4" />
                            {pm.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hoàn tiền</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ví dụ: Khách hủy dịch vụ ăn sáng, hoàn 500,000đ..."
                      className="resize-none"
                      rows={3}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {field.value?.length || 0}/500 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending || refundAmount <= 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>Xác nhận hoàn tiền</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
