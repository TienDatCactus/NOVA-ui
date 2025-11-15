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

interface PendingServicesTableProps {
  orders: BookingPendingChargesResponseDto["pendingOrders"]["serviceOrders"];
}

export default function PendingServicesTable({
  orders,
}: PendingServicesTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Không có đơn dịch vụ nào đang chờ</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Trạng thái</TableHead>
            <TableHead>Dịch vụ</TableHead>
            <TableHead className="w-[140px]">Thời gian hẹn</TableHead>
            <TableHead className="w-[140px]">Thời gian thực hiện</TableHead>
            <TableHead className="text-right w-[80px]">SL</TableHead>
            <TableHead className="text-right w-[120px]">Đơn giá</TableHead>
            <TableHead className="text-right w-[120px]">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Badge variant="warning" className="text-xs">
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">{order.serviceName}</p>
              </TableCell>
              <TableCell>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(order.scheduledAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-xs text-muted-foreground">
                  {order.performedAt
                    ? format(parseISO(order.performedAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })
                    : "—"}
                </p>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="text-sm">{order.quantity}</span>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatMoney(order.unitPrice).vndFormatted}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatMoney(order.subtotal).vndFormatted}
              </TableCell>
            </TableRow>
          ))}
          {/* Summary row */}
          <TableRow className="bg-muted/30 font-semibold">
            <TableCell colSpan={6} className="text-right">
              Tổng cộng:
            </TableCell>
            <TableCell className="text-right font-mono text-base">
              {
                formatMoney(
                  orders.reduce((sum, order) => sum + order.subtotal, 0)
                ).vndFormatted
              }
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
