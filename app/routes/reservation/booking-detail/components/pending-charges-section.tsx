import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Info, Utensils, Sparkles, AlertCircle, Plus } from "lucide-react";
import PendingPosTable from "../fragments/pending-pos-table";
import PendingServicesTable from "../fragments/pending-services-table";
import { formatMoney } from "~/lib/utils";
import { useBookingPendingCharges } from "../container/use-booking-checkout.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface PendingChargesSectionProps {
  bookingId: string;
  onAddCompletedCharges: () => void;
  canAddCharges?: boolean; // Permission check from parent
}

export default function PendingChargesSection({
  bookingId,
  onAddCompletedCharges,
  canAddCharges = true,
}: PendingChargesSectionProps) {
  const {
    data: pendingCharges,
    isPending,
    error,
  } = useBookingPendingCharges(bookingId);

  if (isPending) {
    return (
      <Card className="shadow-sm ">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm px-0 py-4">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải thông tin chi phí. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!pendingCharges) {
    return null;
  }

  const { pendingOrders, roomInvoice, summary } = pendingCharges;
  const totalDue = summary?.totalDue || 0;

  // Calculate individual totals
  const posTotal =
    pendingOrders.posOrders?.reduce(
      (sum, order) =>
        sum + order.items.reduce((s, item) => s + item.subtotal, 0),
      0
    ) || 0;

  const serviceTotal =
    pendingOrders.serviceOrders?.reduce(
      (sum, order) => sum + order.subtotal,
      0
    ) || 0;

  return (
    <Card className="shadow-sm p-0 py-4">
      <CardHeader className="">
        <CardTitle className="text-lg">Chi phí chưa thanh toán </CardTitle>
        <CardAction>
          {canAddCharges && (
            <Button
              variant="link"
              size="sm"
              onClick={onAddCompletedCharges}
              className="ml-2 h-auto p-0"
            >
              <Plus />
              Thêm phí ngoài order
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Đồ ăn/Đồ uống</h4>
                  <span className="text-xs text-muted-foreground">
                    {pendingCharges.pendingOrders.posOrders.length} đơn
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên món</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCharges.pendingOrders.posOrders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-xs text-muted-foreground"
                          >
                            Không có món chưa thanh toán
                          </TableCell>
                        </TableRow>
                      )}
                      {pendingCharges.pendingOrders.posOrders.map((order) =>
                        order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium truncate max-w-[160px]">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-xs">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-xs">
                              {formatMoney(item.unitPrice).vndFormatted}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold text-xs">
                              {formatMoney(item.subtotal).vndFormatted}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Dịch vụ</h4>
                  <span className="text-xs text-muted-foreground">
                    {pendingCharges.pendingOrders.serviceOrders.length} đơn
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên dịch vụ</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Lên lịch</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCharges.pendingOrders.serviceOrders.length ===
                        0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-xs text-muted-foreground"
                          >
                            Không có dịch vụ chưa thanh toán
                          </TableCell>
                        </TableRow>
                      )}
                      {pendingCharges.pendingOrders.serviceOrders.map(
                        (service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium truncate max-w-[160px]">
                              {service.serviceName}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-xs">
                              {service.quantity}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-xs">
                              {formatMoney(service.unitPrice).vndFormatted}
                            </TableCell>
                            <TableCell className="text-right text-[10px] text-muted-foreground">
                              {format(
                                parseISO(service.scheduledAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold text-xs">
                              {formatMoney(service.subtotal).vndFormatted}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <Card className="space-y-3 gap-0 order-last p-4 rounded-lg  border">
              <CardHeader className="p-0">
                <CardTitle className="font-semibold text-sm">
                  Chi phí phòng
                </CardTitle>
              </CardHeader>
              {pendingCharges.roomInvoice ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tổng</span>
                    <span className="font-medium tabular-nums">
                      {
                        formatMoney(pendingCharges.roomInvoice.total)
                          .vndFormatted
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Đã thanh toán</span>
                    <span className="font-medium tabular-nums text-green-600">
                      -
                      {
                        formatMoney(pendingCharges.roomInvoice.paid)
                          .vndFormatted
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Còn lại</span>
                    <span className="tabular-nums">
                      {
                        formatMoney(pendingCharges.roomInvoice.balance)
                          .vndFormatted
                      }
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Không có chi phí phòng chưa thanh toán
                </p>
              )}
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
