import { useNavigate, useParams } from "react-router";
import { usePOSOrderDetail } from "./container/pos-orders-query.hooks";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import MenuBrowser from "./components/menu-browser";
import OrderCart from "./components/order-cart";
import type { Route } from "./+types/detail";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { posId } = useParams();

  const { data: order, isPending, isError } = usePOSOrderDetail(posId || "");

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Đang tải đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-semibold text-destructive">
              Không tìm thấy đơn hàng
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Đơn hàng không tồn tại hoặc đã bị xóa
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/pos-orders")}
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = order.status === "Completed";
  const isCancelled = order.status === "Cancelled";
  const isEditable = !isCompleted && !isCancelled;

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/pos-orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
                <Badge
                  variant={
                    isCompleted
                      ? "default"
                      : isCancelled
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {order.status === "Completed"
                    ? "Hoàn thành"
                    : order.status === "Cancelled"
                      ? "Đã hủy"
                      : order.status === "InProgress"
                        ? "Đang xử lý"
                        : "Chờ xử lý"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Hóa đơn: {order.invoiceId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/pos-orders/${posId}/print`)}
            >
              <Printer className="mr-2 h-4 w-4" />
              In
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid h-[calc(100%-5rem)] grid-cols-1 lg:grid-cols-2">
        {/* Left: Menu Browser */}
        <div className="border-r bg-muted/30 p-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Thực đơn</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <MenuBrowser orderId={posId || ""} isEditable={isEditable} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Cart */}
        <div className="p-6">
          <OrderCart
            orderId={posId || ""}
            order={order}
            isEditable={isEditable}
          />
        </div>
      </div>
    </div>
  );
}
