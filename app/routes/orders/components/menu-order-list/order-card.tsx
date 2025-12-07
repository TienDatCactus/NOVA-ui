import { format, parseISO, isBefore } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarClock,
  Clock,
  User,
  BedDouble,
  MapPin,
  Utensils,
  MoreVertical,
  Notebook,
  NotepadText,
} from "lucide-react";

import { cn, formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { OrderActionMenu } from "./order-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import { AuthLoader } from "~/lib/auth/auth.loader";

interface OrderCardProps {
  order: POSOrderDetailDto;
  onClick: () => void;
}

// Status Colors for the Left Border Indicator
const statusColors: Record<string, string> = {
  Open: "border-l-primary",
  Processing: "border-l-orange-500",
  Completed: "border-l-green-500",
  Cancelled: "border-l-gray-400",
};

const statusTextColors: Record<string, string> = {
  Open: "text-blue-700 bg-blue-50",
  Processing: "text-orange-700 bg-orange-50",
  Completed: "text-emerald-700 bg-emerald-50",
  Cancelled: "text-gray-600 bg-gray-100",
};

const statusLabels: Record<string, string> = {
  Open: "Mới",
  Processing: "Đang làm",
  Completed: "Hoàn tất",
  Cancelled: "Đã hủy",
};

export default function OrderCard({ order, onClick }: OrderCardProps) {
  // Logic: Time & Priority
  const isScheduled = !!order.scheduledAt;
  const isLate =
    isScheduled && isBefore(parseISO(order.scheduledAt!), new Date());

  // Logic: Items Preview (Show top 2 items)
  const previewItems = order.items?.slice(0, 2) || [];
  const remainingCount = (order.items?.length || 0) - previewItems.length;

  const locationLabel =
    order.customerType === "In-House" ? `Khách nội bộ` : "Khách lẻ"; // Fallback if no room name

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-none border bg-card shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden",
        "border-l-4", // The Status Indicator Line
        statusColors[order.status],
        order.status === "Cancelled" && "opacity-75 grayscale-[0.3]"
      )}
    >
      <div className="flex items-start justify-between p-3 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              #{order.id.slice(-6).toUpperCase()}
            </span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider",
                statusTextColors[order.status]
              )}
            >
              {statusLabels[order.status]}
            </span>
            <span>
              {(order.note?.length ?? 0) > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <NotepadText className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>{order.note}</TooltipContent>
                </Tooltip>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {isScheduled ? (
              <span
                className={cn(
                  "flex items-center gap-1",
                  isLate && "text-destructive font-medium"
                )}
              >
                <CalendarClock className="h-3 w-3" />
                {format(parseISO(order.scheduledAt!), "HH:mm", { locale: vi })}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(parseISO(order.createdAt), "HH:mm", { locale: vi })}
              </span>
            )}
          </div>
        </div>

        {/* Action Menu Trigger (Invisible until hover or specific click) */}
        {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) && (
          <div onClick={(e) => e.stopPropagation()}>
            <OrderActionMenu
              orderId={order.id}
              status={order.status}
              currentScheduledTime={order.scheduledAt}
            />
          </div>
        )}
      </div>

      {/* === BODY: ITEM PREVIEW (The "Summary" Part) === */}
      <div className="px-3 py-2 space-y-1.5 min-h-[60px]">
        {previewItems.length > 0 ? (
          previewItems.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between text-xs text-foreground/80"
            >
              <span className="truncate pr-2">
                <span className="font-semibold text-foreground mr-1">
                  {item.quantity}x
                </span>
                {item.itemName}
              </span>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Chưa có món
          </span>
        )}

        {remainingCount > 0 && (
          <div className="text-[10px] text-muted-foreground font-medium pl-0.5">
            + {remainingCount} món khác...
          </div>
        )}
      </div>

      {/* === FOOTER: LOCATION & TOTAL === */}
      <div className="mt-auto px-3 py-2.5 border-t border-dashed bg-muted/10 flex items-center justify-between">
        {/* Location Context */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          {order.customerType === "In-House" ? (
            <BedDouble className="h-3.5 w-3.5" />
          ) : (
            <User className="h-3.5 w-3.5" />
          )}
          <span className="truncate max-w-[80px]">{locationLabel}</span>
        </div>

        {/* Total Price */}
        <div className="font-mono text-base font-bold text-foreground">
          {formatMoney(order.totalAmount).vndFormatted}
        </div>
      </div>
    </div>
  );
}
