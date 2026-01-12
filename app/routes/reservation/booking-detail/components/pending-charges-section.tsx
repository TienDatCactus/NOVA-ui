import {
  AlertCircle,
  BedDouble,
  Plus,
  Receipt,
  Sparkles,
  Utensils,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader, hasAnyRole, UserRole } from "~/lib/auth/auth.loader";
import { cn, formatMoney } from "~/lib/utils";
import CurrencyView from "~/components/currency-view";
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

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState />;
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
  const hasItems = totalPending > 0;

  return (
    <CurrencyView amount={totalPending}>
      <Card className="h-full   hover:border-primary flex flex-col bg-background p-4 shadow-sm">
        {/* 1. HERO TOTAL (Sticky Top) */}
        <CardHeader className=" pt-0 px-0 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              Cần thanh toán
            </CardTitle>
            <div className="flex items-center gap-2">
              <CurrencyView.Toggle />
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
                canAddCharges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddCompletedCharges}
                    className="h-8 text-xs gap-1.5 rounded-full border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm phí
                  </Button>
                )}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm flex justify-between items-end relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Receipt className="w-24 h-24" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                Tổng dư nợ
              </p>
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  totalPending > 0 ? "text-primary" : "text-emerald-600"
                )}
              >
                {formatMoney(totalPending).vndFormatted}
              </p>

              {/* Currency Conversion */}
              <div className="mt-3 pt-3 border-t flex items-center justify-between w-full">
                <span className="text-xs text-muted-foreground">Quy đổi:</span>
                <CurrencyView.Select />
              </div>
              <div className="mt-1">
                <CurrencyView.Display showLabel={false} />
              </div>
            </div>
            {totalPending === 0 && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Đã thanh toán
              </Badge>
            )}
          </div>
        </CardHeader>

        <div className="space-y-5 pb-4">
          {roomInvoice && roomInvoice.balance > 0 && (
            <section className="space-y-2">
              <SectionHeader icon={BedDouble} title="Tiền phòng còn thiếu" />
              <div className="bg-background rounded-xl border p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Mã hóa đơn</span>
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] h-5"
                  >
                    {roomInvoice.invoiceNo}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <ReceiptRow label="Tổng giá trị" value={roomInvoice.total} />
                  <ReceiptRow
                    label="Đã thanh toán"
                    value={-roomInvoice.paid}
                    className="text-emerald-600"
                  />
                  <Separator className="my-2 border-dashed" />
                  <ReceiptRow
                    label="Còn lại"
                    value={roomInvoice.balance}
                    className="font-bold text-base"
                  />
                </div>
              </div>
            </section>
          )}
          {pendingOrders.posOrders.length > 0 && (
            <section className="space-y-2">
              <SectionHeader
                icon={Utensils}
                title="Đồ ăn & Uống"
                count={pendingOrders.posOrders.length}
              />
              <div className="bg-background rounded-xl border divide-y shadow-sm">
                {pendingOrders.posOrders.map((order) => (
                  <div key={order.id} className="p-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start text-sm"
                      >
                        <div className="flex gap-2">
                          <span className="font-mono text-muted-foreground w-6 text-right pt-0.5">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-foreground/90">
                            {item.itemName}
                          </span>
                        </div>
                        <span className="font-mono text-muted-foreground">
                          {formatMoney(item.subtotal).vndFormatted}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="p-3 bg-muted/20 flex justify-between items-center text-sm font-medium">
                  <span>Tổng mục</span>
                  <span>{formatMoney(posTotal).vndFormatted}</span>
                </div>
              </div>
            </section>
          )}

          {/* C. Services Section */}
          {pendingOrders.serviceOrders.length > 0 && (
            <section className="space-y-2">
              <SectionHeader
                icon={Sparkles}
                title="Dịch vụ"
                count={pendingOrders.serviceOrders.length}
              />
              <div className="bg-background rounded-xl border divide-y shadow-sm">
                {pendingOrders.serviceOrders.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 flex justify-between items-start text-sm"
                  >
                    <div className="space-y-0.5">
                      <div className="flex gap-2">
                        <span className="font-mono text-muted-foreground">
                          {service.quantity}x
                        </span>
                        <span className="font-medium">
                          {service.serviceName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        Lên lịch: {service.scheduledAt?.split("T")[0]}
                      </p>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      {formatMoney(service.subtotal).vndFormatted}
                    </span>
                  </div>
                ))}
                <div className="p-3 bg-muted/20 flex justify-between items-center text-sm font-medium">
                  <span>Tổng mục</span>
                  <span>{formatMoney(serviceTotal).vndFormatted}</span>
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!hasItems && (
            <div className="h-40 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Không có khoản phí nào chờ thanh toán
              </p>
            </div>
          )}
        </div>
      </Card>
    </CurrencyView>
  );
}

// --- Helper Components ---

function LoadingState() {
  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader className="px-0">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-2xl mt-4" />
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function ErrorState() {
  return (
    <Alert
      variant="destructive"
      className="bg-red-50 border-red-100 text-red-900"
    >
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription>Không thể tải thông tin chi phí.</AlertDescription>
    </Alert>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
}: {
  icon: any;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 px-1">
      <Icon className="w-4 h-4 text-muted-foreground" />
      {title}
      {count !== undefined && (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between items-center text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{formatMoney(value).vndFormatted}</span>
    </div>
  );
}
