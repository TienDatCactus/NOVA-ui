import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { ServiceOrderListItemDto } from "~/services/api/orders/dto";
import { CalendarClock, BedDouble, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

import ServiceOrderDetails from "./service-order-details";
import {
  ServiceActionMenu,
  ServiceFooterActions,
} from "./service-order-actions";
import { useBookingDetail } from "~/routes/reservation/bookings/container/booking-query.hooks";

interface ServiceOrderCardProps {
  order: ServiceOrderListItemDto;
}

const statusConfig = {
  Scheduled: {
    label: "Đã lên lịch",
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
  NoShow: {
    label: "Không đến",
    className: "bg-orange-600 text-white hover:bg-orange-700",
  },
};

export default function ServiceOrderCard({ order }: ServiceOrderCardProps) {
  const currentStatus =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.Scheduled;
  const scheduledDate = order.scheduledAt ? parseISO(order.scheduledAt) : null;
  const { data: bookingDetail } = useBookingDetail({
    bookingId: order.bookingId || "",
    enabled: !!order.bookingId,
  });
  const displayBookingInfo = {
    icon: <User className="h-3.5 w-3.5" />,
    text: order.bookingId
      ? `Khách: ${bookingDetail?.customer.fullName || "N/A"}`
      : "Khách lẻ",
  };

  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-xl border border-muted bg-white shadow-sm transition-all hover:shadow-md hover:border-primary">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-white font-mono text-[10px] font-bold text-gray-500"
          >
            #{order.id?.slice(0, 6)}
          </Badge>

          {/* Booking Context Pill - Quan trọng để nhân viên biết phục vụ ai/phòng nào */}
          <div className="flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 shadow-sm">
            {displayBookingInfo.icon}
            <span className="truncate ">{displayBookingInfo.text}</span>
          </div>
        </div>

        {/* Action Menu (3 dots) */}

        <ServiceActionMenu
          orderId={order.id || ""}
          status={order.status}
          currentScheduledTime={order.scheduledAt}
        />
      </div>

      {/* 2. BODY: Main Content */}
      <div className="flex-1 px-4 py-3 bg-white flex flex-col">
        {/* Service Name - Big & Bold */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
              {order.serviceName || order.customServiceName}
            </h3>

            {/* Schedule Time - Critical Info */}
            {scheduledDate && (
              <div className="flex items-center gap-2 text-sm text-blue-700 font-medium mb-3">
                <CalendarClock className="h-4 w-4" />
                <span>
                  {format(scheduledDate, "HH:mm", { locale: vi })}
                  <span className="text-gray-400 font-normal mx-1">|</span>
                  {format(scheduledDate, "dd/MM", { locale: vi })}
                </span>
              </div>
            )}
          </div>
          <Badge
            className={cn(
              "border-0 text-[10px] h-5 px-2",
              currentStatus.className
            )}
          >
            {currentStatus.label}
          </Badge>
        </div>

        {/* Details Component (Dumb Component) */}
        <ServiceOrderDetails order={order} bookingDetail={bookingDetail} />
      </div>

      <div className="mt-auto bg-gray-50 px-4 py-3 border-t border-dashed border-gray-300">
        <ServiceFooterActions orderId={order.id || ""} status={order.status} />
      </div>
    </div>
  );
}
