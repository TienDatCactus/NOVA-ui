import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { formatMoney, cn } from "~/lib/utils";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import {
  ChevronDown,
  ChevronUp,
  User,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import ServiceOrderActions from "./service-order-actions";
import ServiceOrderDetails from "./service-order-details";

interface ServiceOrderCardProps {
  order: ServiceOrderDetailDto;
}

const statusConfig = {
  Scheduled: {
    label: "Đã lên lịch",
    className: "bg-blue-500 text-white",
  },
  Completed: {
    label: "Hoàn thành",
    className: "bg-green-500 text-white",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-destructive text-destructive-foreground",
  },
  NoShow: {
    label: "Không đến",
    className: "bg-orange-500 text-white",
  },
};

export default function ServiceOrderCard({ order }: ServiceOrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusInfo = statusConfig[order.status];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Order Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  #{order.id.slice(0, 8)}
                </Badge>
                <Badge className={cn("text-xs", statusInfo.className)}>
                  {statusInfo.label}
                </Badge>
              </div>

              {/* Service Info */}
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  {order.serviceItemName || order.customServiceName}
                </p>
                {order.serviceItemCode && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {order.serviceItemCode}
                  </p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Số lượng</p>
                  <p className="font-medium">{order.quantity}x</p>
                </div>

                {order.scheduledAt && (
                  <div>
                    <p className="text-muted-foreground text-xs">Lịch hẹn</p>
                    <p className="font-medium flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(parseISO(order.scheduledAt), "HH:mm - dd/MM", {
                        locale: vi,
                      })}
                    </p>
                  </div>
                )}

                {order.assignedToStaffName && (
                  <div>
                    <p className="text-muted-foreground text-xs">Nhân viên</p>
                    <p className="font-medium flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.assignedToStaffName}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-xs">Tổng tiền</p>
                  <p className="font-semibold text-primary">
                    {formatMoney(order.total).vndFormatted}
                  </p>
                </div>
              </div>

              {order.note && (
                <p className="text-sm text-muted-foreground italic">
                  Ghi chú: {order.note}
                </p>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex-shrink-0">
              <ServiceOrderActions order={order} />
            </div>
          </div>

          {/* Expand/Collapse Trigger */}
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 hover:bg-muted"
            >
              <span className="text-xs text-muted-foreground">
                {isOpen ? "Ẩn chi tiết" : "Xem chi tiết"}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <ServiceOrderDetails order={order} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
