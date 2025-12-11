import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { RotateCcw, User } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useRefundHistory } from "../../container/use-refund.hooks";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { ScrollArea } from "~/components/ui/scroll-area";

interface RefundHistoryProps {
  bookingId: string;
}

export default function RefundHistory({ bookingId }: RefundHistoryProps) {
  const { data: refundHistory, isPending } = useRefundHistory(bookingId);

  if (isPending) return <Skeleton className="h-24 w-full rounded-lg" />;

  if (!refundHistory?.refunds?.length) return null;

  const { refunds } = refundHistory;
  const totalRefunded = refunds.reduce((sum, r) => sum + r.refundedAmount, 0);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* 1. Summary Header - Immediate Context */}
      <div className="p-3 border-b bg-destructive/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold uppercase text-destructive tracking-wide">
            Đã hoàn tiền
          </span>
        </div>
        <span className="font-mono font-bold text-destructive text-sm">
          -{formatMoney(totalRefunded).vndFormatted}
        </span>
      </div>

      {/* 2. Scrollable List - Better for small containers than Tables */}
      <ScrollArea className="h-[200px] p-0">
        <div className="divide-y">
          {refunds.map((refund) => {
            const PaymentIcon =
              PAYMENT_METHODS.find((pm) => pm.value === refund.refundMethod)
                ?.icon || RotateCcw;

            return (
              <div
                key={refund.refundPaymentId}
                className="p-3 hover:bg-muted/50 transition-colors flex flex-col gap-1.5"
              >
                {/* Top Row: Amount & Date */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium text-destructive text-sm">
                    -{formatMoney(refund.refundedAmount).vndFormatted}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(parseISO(refund.refundedAt), "HH:mm dd/MM", {
                      locale: vi,
                    })}
                  </span>
                </div>

                {/* Middle Row: Method & User */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <PaymentIcon className="w-3 h-3" />
                    <span>
                      {PAYMENT_METHODS.find(
                        (pm) => pm.value === refund.refundMethod
                      )?.label || refund.refundMethod}
                    </span>
                  </div>
                  {/* Placeholder for User if available later */}
                  {/* <div className="flex items-center gap-1 border-l pl-3">
                    <User className="w-3 h-3" />
                    <span>Admin</span>
                  </div> */}
                </div>

                {refund.note && (
                  <div className="text-[11px] text-muted-foreground/80 bg-muted/30 p-1.5 rounded mt-1 italic line-clamp-2">
                    "{refund.note}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
