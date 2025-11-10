import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  DollarSign,
  FileText,
} from "lucide-react";

interface ServiceOrderDetailsProps {
  order: ServiceOrderDetailDto;
}

export default function ServiceOrderDetails({
  order,
}: ServiceOrderDetailsProps) {
  return (
    <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
      {/* Service Details */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Thông tin dịch vụ
        </h4>
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
            <p className="font-medium">{order.quantity}x</p>
          </div>
          <div>
            <p className="text-muted-foreground">Đơn giá</p>
            <p className="font-medium">
              {order.unitPrice.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Chi tiết giá
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>
              {(order.quantity * order.unitPrice).toLocaleString("vi-VN")} ₫
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Giảm giá</span>
              <span>-{order.discountAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Tổng cộng</span>
            <span className="text-primary">
              {order.total.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Timeline */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Thời gian
        </h4>
        <div className="space-y-2 text-sm">
          {order.scheduledAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Lịch hẹn:</span>
              <span className="font-medium">
                {format(parseISO(order.scheduledAt), "HH:mm - dd/MM/yyyy", {
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
                {format(parseISO(order.performedAt), "HH:mm - dd/MM/yyyy", {
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
                {format(parseISO(order.completedAt), "HH:mm - dd/MM/yyyy", {
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
                {format(parseISO(order.createdAt), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Staff Assignment */}
      {order.assignedToStaffName && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Nhân viên phụ trách
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{order.assignedToStaffName}</Badge>
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
