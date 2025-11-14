import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Info, Utensils, Sparkles, AlertCircle } from "lucide-react";
import PendingPosTable from "../fragments/pending-pos-table";
import PendingServicesTable from "../fragments/pending-services-table";
import { formatMoney } from "~/lib/utils";
import { useBookingPendingCharges } from "../container/use-booking-checkout.hooks";

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
      <Card className="shadow-sm">
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
      <Card className="shadow-sm border-destructive/50">
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
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chi phí chưa thanh toán</CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Tổng nợ</p>
            <p className="text-2xl font-bold font-mono text-destructive">
              {formatMoney(totalDue).vndFormatted}
            </p>
          </div>
        </div>
        {canAddCharges && (
          <Alert variant={"info"}>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Khách sử dụng món chưa order trước? (minibar, snacks...)
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={onAddCompletedCharges}
                className="ml-2 h-auto p-0"
              >
                Thêm phí ngoài order
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* <div className="grid grid-cols-3 gap-4">
          <Card className=" bg-white p-0">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Chi phí phòng
              </p>
              <p className="text-xl font-bold font-mono">
                {formatMoney(roomInvoice?.balance || 0).vndFormatted}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Tổng:</span>
                  <span className="font-mono">
                    {formatMoney(roomInvoice?.total || 0).vndFormatted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Đã trả:</span>
                  <span className="font-mono text-green-600">
                    -{formatMoney(roomInvoice?.paid || 0).vndFormatted}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 p-0">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Đồ ăn/Đồ uống
              </p>
              <p className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
                {formatMoney(posTotal).vndFormatted}
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingOrders.posOrders?.length || 0} đơn chưa thanh toán
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 p-0">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Dịch vụ
              </p>
              <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {formatMoney(serviceTotal).vndFormatted}
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingOrders.serviceOrders?.length || 0} đơn chưa thanh toán
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Tabbed Tables */}
        <Tabs defaultValue="pos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pos">
              <Utensils className="h-4 w-4 mr-2" />
              Đồ ăn/Đồ uống ({pendingOrders.posOrders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="service">
              <Sparkles className="h-4 w-4 mr-2" />
              Dịch vụ ({pendingOrders.serviceOrders?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-4 mt-4">
            <PendingPosTable orders={pendingOrders.posOrders || []} />

            {/* Quick Add Completed Charges */}
          </TabsContent>

          <TabsContent value="service" className="mt-4">
            <PendingServicesTable orders={pendingOrders.serviceOrders || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
