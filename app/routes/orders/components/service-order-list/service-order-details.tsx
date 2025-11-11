import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useServiceOrderDetail } from "../../container/service-order/query.hooks";

interface ServiceOrderDetailsProps {
  orderId: string;
  open: boolean;
}

export default function ServiceOrderDetails({
  orderId,
  open,
}: ServiceOrderDetailsProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useServiceOrderDetail(orderId, { enabled: open });
  console.log(order);
  if (isLoading) {
    return (
      <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-muted/30 p-4 rounded-lg">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải chi tiết đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg">
      {/* Service Details */}
      <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Tên dịch vụ</p>
            <p className="font-medium">
              {order.serviceItemName || order.customServiceName}
            </p>
          </div>
          {order.serviceItemCode && (
            <div>
              <p className="text-muted-foreground">Mã dịch vụ</p>
              <p className="font-mono text-xs">{order.serviceItemCode}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Số lượng</p>
            <p className="font-medium">
              {formatMoney(order.unitPrice).vndFormatted}
              <sup> x {order.quantity}</sup>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Đơn giá</p>
            <p className="font-medium">
              {formatMoney(order.unitPrice).vndFormatted}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            {order.scheduledAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Lịch hẹn:</span>
                <span className="font-medium">
                  {format(order.scheduledAt, "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}
            {order.performedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Thực hiện:</span>
                <span className="font-medium">
                  {format(order.performedAt, "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}
            {order.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Hoàn thành:</span>
                <span className="font-medium">
                  {format(order.completedAt, "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}
            {order.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Tạo lúc:</span>
                <span className="font-medium">
                  {format(order.createdAt, "HH:mm - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Chi tiết giá
              </h4>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>
                {formatMoney(order.quantity * order.unitPrice).vndFormatted}
              </span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Giảm giá</span>
              <span>-{formatMoney(order.discountAmount).vndFormatted}</span>
            </div>
            <div className="flex justify-between text-green-500">
              <span>Thuế</span>
              <span>{formatMoney(order.vatAmount).vndFormatted}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Tổng cộng</span>
              <span className="text-primary">
                {order.total.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.assignedToStaffId && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Nhân viên phụ trách
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {order.assignedToStaffId}
              </Badge>
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {order.note && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Ghi chú</h4>
            <p className="text-sm text-muted-foreground italic">{order.note}</p>
          </div>
        </>
      )}
    </div>
  );
}
