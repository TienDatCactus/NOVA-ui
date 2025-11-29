import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn, formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { Clock, StickyNote, CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

import OrderDetails from "./order-details";
import {
  OrderActionMenu,
  OrderFooterActions,
  OrderAddButton,
} from "./order-actions";
import InlineNoteEditor from "./inline-note-editor";

interface OrderCardProps {
  order: POSOrderDetailDto;
}

const statusConfig = {
  Open: {
    label: "Đang mở",
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
  Completed: {
    label: "Hoàn thành",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-gray-500 text-white hover:bg-gray-600",
  },
};

export default function OrderCard({ order }: OrderCardProps) {
  const currentStatus =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.Open;

  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary">
      <div className="flex items-center justify-between border-b border-muted bg-muted px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-white font-mono text-xs font-bold text-gray-800"
          >
            #{order.id.slice(0, 8)}
          </Badge>
          <Badge
            className={cn(
              "border-0 text-[10px] font-semibold uppercase tracking-wider",
              currentStatus.className
            )}
          >
            {currentStatus.label}
          </Badge>
        </div>

        {/* Fragment: Action Menu (3 dots) */}
        <OrderActionMenu
          orderId={order.id}
          status={order.status}
          currentScheduledTime={order.scheduledAt}
        />
      </div>

      {/* 2. SUB-HEADER: Meta Info */}
      <div className="px-4 py-2 bg-white flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span>
            {format(
              parseISO(order.createdAt || new Date().toISOString()),
              "HH:mm dd/MM",
              { locale: vi }
            )}
          </span>
        </div>
        {order.scheduledAt && (
          <div className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>
              Hẹn:{" "}
              {format(parseISO(order.scheduledAt), "HH:mm", { locale: vi })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 w-full mt-1">
          <StickyNote className="h-3.5 w-3.5 text-gray-400" />
          <div className="flex-1">
            <InlineNoteEditor
              orderId={order.id}
              initialNote={order.note || ""}
              disabled={order.status !== "Open"}
            />
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* 3. BODY: Order Details */}
      <div className="flex-1 px-4 py-2 bg-white flex flex-col">
        <OrderDetails order={order} />

        <OrderAddButton orderId={order.id} status={order.status} />
      </div>

      {/* 4. FOOTER: Totals & Primary Actions */}
      <div className="mt-auto bg-gray-50 px-4 py-4 border-t border-dashed border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng tiền
          </span>
          <span className="text-xl font-bold text-primary">
            {formatMoney(order.totalAmount).vndFormatted}
          </span>
        </div>

        {/* Fragment: Footer Actions (Pay/Complete) */}
        <OrderFooterActions
          orderId={order.id}
          status={order.status}
          totalAmount={order.totalAmount}
          invoiceId={order.invoiceId}
        />
      </div>
    </div>
  );
}
