import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { formatMoney } from "~/lib/utils";
import type { BookingPendingChargesResponseDto } from "~/services/api/booking/dto";

interface PendingPosTableProps {
  orders: BookingPendingChargesResponseDto["pendingOrders"]["posOrders"];
}

export default function PendingPosTable({ orders }: PendingPosTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Không có đơn đồ ăn/uống nào đang chờ</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">Đơn hàng</TableHead>
            <TableHead className="w-[100px]">Thời gian</TableHead>
            <TableHead>Món</TableHead>
            <TableHead className="text-right w-[80px]">SL</TableHead>
            <TableHead className="text-right w-[120px]">Đơn giá</TableHead>
            <TableHead className="text-right w-[120px]">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            return order.items.map((item, idx) => (
              <TableRow key={`${order.id}-${item.id}`}>
                {idx === 0 && (
                  <>
                    <TableCell
                      rowSpan={order.items.length}
                      className="align-top"
                    >
                      <div className="space-y-1">
                        <Badge variant="warning" className="text-xs">
                          {order.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(order.createdAt), "dd/MM HH:mm", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell
                      rowSpan={order.items.length}
                      className="align-top"
                    >
                      <p className="text-xs text-muted-foreground">
                        {item.servedAt
                          ? format(parseISO(item.servedAt), "HH:mm", {
                              locale: vi,
                            })
                          : "—"}
                      </p>
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <p className="text-sm font-medium">{item.itemName}</p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="text-sm">{item.quantity}</span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatMoney(item.unitPrice).vndFormatted}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatMoney(item.subtotal).vndFormatted}
                </TableCell>
              </TableRow>
            ));
          })}
          {/* Summary row */}
          <TableRow className="bg-muted/30 font-semibold">
            <TableCell colSpan={5} className="text-right">
              Tổng cộng:
            </TableCell>
            <TableCell className="text-right font-mono text-base">
              {
                formatMoney(
                  orders.reduce(
                    (sum, order) =>
                      sum +
                      order.items.reduce((s, item) => s + item.subtotal, 0),
                    0
                  )
                ).vndFormatted
              }
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
