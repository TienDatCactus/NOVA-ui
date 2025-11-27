import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { RotateCcw } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useRefundHistory } from "../../container/use-refund.hooks";
import { PAYMENT_METHODS } from "~/services/types/payment.types";

interface RefundHistoryProps {
  bookingId: string;
}

export default function RefundHistory({ bookingId }: RefundHistoryProps) {
  const { data: refundHistory, isPending } = useRefundHistory(bookingId);
  console.log(refundHistory);
  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (
    !refundHistory ||
    !refundHistory.refunds ||
    refundHistory.refunds.length === 0
  ) {
    return null; // Don't show section if no refunds
  }

  const { refunds } = refundHistory;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-semibold">Lịch sử hoàn tiền</h3>
        <Badge variant="destructive" className="text-xs">
          {refunds.length}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Thời gian</TableHead>
            <TableHead className="w-[120px]">Phương thức</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead className="w-[100px]">Người thực hiện</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.map((refund) => {
            const PaymentIcon =
              PAYMENT_METHODS.find((pm) => pm.value === refund.refundMethod)
                ?.icon || RotateCcw;

            return (
              <TableRow
                key={refund.refundPaymentId}
                className="bg-destructive/5"
              >
                <TableCell className="text-sm text-muted-foreground">
                  {format(parseISO(refund.refundedAt), " HH:mm dd/MM/yyyy", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <PaymentIcon className="w-4 h-4 text-destructive" />
                    <span className="text-sm">
                      {PAYMENT_METHODS.find(
                        (pm) => pm.value === refund.refundMethod
                      )?.label || refund.refundMethod}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-semibold text-destructive">
                    -{formatMoney(refund.refundedAmount).vndFormatted}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {refund.note || (
                      <em className="text-xs">Không có ghi chú</em>
                    )}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  —
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Summary */}
      <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-destructive">
            Tổng đã hoàn:
          </span>
          <span className="font-mono font-bold text-destructive text-lg">
            -
            {
              formatMoney(refunds.reduce((sum, r) => sum + r.refundedAmount, 0))
                .vndFormatted
            }
          </span>
        </div>
      </div>
    </div>
  );
}
