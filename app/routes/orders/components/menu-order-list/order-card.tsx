import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import OrderActions from "./order-actions";
import OrderDetails from "./order-details";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import InlineNoteEditor from "./inline-note-editor";

interface OrderCardProps {
  order: POSOrderDetailDto;
}

const statusConfig = {
  Open: {
    label: "Đang mở",
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
};

export default function OrderCard({ order }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = order?.items?.length || 0;
  const statusInfo = statusConfig[order.status];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  #{order.id.slice(0, 8)}
                </Badge>
                <Badge
                  variant={statusInfo.variant as any}
                  className={cn("text-xs")}
                >
                  {statusInfo.label}
                </Badge>
                {itemCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {itemCount} món
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div>
                  <p className="text-muted-foreground text-xs">Ngày tạo</p>
                  <p className="font-medium">
                    {format(
                      parseISO(order.createdAt || new Date().toISOString()),
                      "HH:mm - dd/MM/yyyy",
                      {
                        locale: vi,
                      }
                    )}
                  </p>
                </div>
                {order.scheduledAt && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Thời gian phục vụ
                    </p>
                    <p className="font-medium">
                      {format(
                        parseISO(order.scheduledAt),
                        "HH:mm - dd/MM/yyyy",
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Tổng tiền</p>
                  <p className="font-semibold text-primary">
                    {formatMoney(order.totalAmount).vndFormatted}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Ghi chú:</p>
                <InlineNoteEditor
                  orderId={order.id}
                  initialNote={order.note || ""}
                  disabled={order.status !== "Open"}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex-shrink-0">
              <OrderActions
                orderId={order.id}
                status={order.status}
                totalAmount={order.totalAmount}
                currentScheduledTime={order.scheduledAt}
                invoiceId={order.invoiceId}
              />
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

        {/* Expandable Details */}
        <CollapsibleContent>
          <CardContent className="pt-0">
            <OrderDetails order={order} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
