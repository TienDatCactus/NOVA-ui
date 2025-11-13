import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { formatMoney, cn } from "~/lib/utils";
import type {
  ServiceOrderDetailDto,
  ServiceOrderListDto,
  ServiceOrderListItemDto,
} from "~/services/api/orders/dto";
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
  order: ServiceOrderListItemDto;
}

const statusConfig = {
  Scheduled: {
    label: "Đã lên lịch",
    variant: "info",
  },
  Completed: {
    label: "Hoàn thành",
    variant: "success",
  },
  Cancelled: {
    label: "Đã hủy",
    variant: "warning",
  },
  NoShow: {
    label: "Không đến",
    variant: "destructive",
  },
};

export default function ServiceOrderCard({ order }: ServiceOrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusInfo = statusConfig[order.status];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow py-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Order Info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  #{order.id?.slice(0, 8) || "N/A"}
                </Badge>
                <Badge
                  className={cn("text-xs")}
                  variant={statusInfo.variant as any}
                >
                  {statusInfo.label}
                </Badge>
              </div>

              {/* Service Info */}
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  {order.serviceName || order.customServiceName}
                </p>
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

                <div>
                  <p className="text-muted-foreground text-xs">Tổng tiền</p>
                  <p className="font-semibold text-primary">
                    {formatMoney(order.quantity * order.unitPrice).vndFormatted}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex-shrink-0">
              <ServiceOrderActions orderId={order.id || ""} />
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
            <ServiceOrderDetails orderId={order.id || ""} open={isOpen} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
