import {
  AlertCircle,
  Plus,
  Receipt,
  Utensils,
  Sparkles,
  Wallet,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";

import { formatMoney, cn } from "~/lib/utils";
import { useBookingPendingCharges } from "../container/use-booking-checkout.hooks";

interface PendingChargesSectionProps {
  bookingId: string;
  onAddCompletedCharges: () => void;
  canAddCharges?: boolean;
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
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải thông tin chi phí. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
    );
  }

  if (!pendingCharges) return null;

  const { pendingOrders, roomInvoice } = pendingCharges;

  // --- Calculations ---
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

  const roomBalance = roomInvoice?.balance || 0;
  const totalPending = posTotal + serviceTotal + roomBalance;

  return (
    <Card className="shadow-sm h-full flex flex-col overflow-hidden p-0 gap-0">
      {/* --- HEADER --- */}
      <CardHeader className="flex flex-row items-center justify-between pt-4 border-b bg-muted/5 space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Chi phí chưa thanh toán
        </CardTitle>
        {canAddCharges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddCompletedCharges}
            className="h-8 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm phí
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col bg-muted/5">
        {/* --- HERO SUMMARY --- */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  {pendingCharges.pendingOrders.serviceOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-xs text-muted-foreground"
                      >
                        Không có dịch vụ chưa thanh toán
                      </TableCell>
                    </TableRow>
                  )}
                  {pendingCharges.pendingOrders.serviceOrders.map((service) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="p-4 bg-background border-b flex justify-between items-center shadow-sm z-10">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng nợ hiện tại
          </span>
          <span
            className={cn(
              "text-2xl font-bold font-mono tracking-tight",
              totalPending > 0 ? "text-destructive" : "text-green-600"
            )}
          >
            {formatMoney(totalPending).vndFormatted}
          </span>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            {/* 1. ROOM CHARGES CARD */}
            {roomInvoice && roomInvoice.balance > 0 && (
              <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/10 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> Tiền phòng
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {roomInvoice.invoiceNo || "N/A"}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng giá trị</span>
                    <span className="font-medium">
                      {formatMoney(roomInvoice.total).vndFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã thanh toán</span>
                    <span className="font-medium text-green-600">
                      -{formatMoney(roomInvoice.paid).vndFormatted}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Còn lại</span>
                    <span className="text-destructive font-mono text-base">
                      {formatMoney(roomInvoice.balance).vndFormatted}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalPending === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium">Không có khoản nợ nào</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Khách hàng đã thanh toán đầy đủ.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
