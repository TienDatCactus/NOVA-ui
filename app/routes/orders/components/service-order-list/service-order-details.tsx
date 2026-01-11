import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  MapPin,
  PlayCircle,
  Receipt,
  User,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import CurrencyView, { useCurrencyView } from "~/components/currency-view";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type { ServiceOrderListItemDto } from "~/services/api/orders/dto";
import { useServiceOrderDetail } from "../../container/service-order/query.hooks";

interface ServiceOrderDetailsProps {
  order: ServiceOrderListItemDto;
  bookingDetail?: BookingDetailResponseDto;
}

function ServiceOrderCurrencySection() {
  const { showConverter } = useCurrencyView();
  
  return (
    <div className="space-y-2">
      <CurrencyView.Toggle />
      {showConverter && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Quy đổi tiền tệ
            </span>
            <CurrencyView.Select />
          </div>
          <CurrencyView.Display showLabel={false} />
        </>
      )}
    </div>
  );
}

export default function ServiceOrderDetails({
  order,
  bookingDetail,
}: ServiceOrderDetailsProps) {
  const {
    data: serviceOrderDetail,
    isLoading,
    isError,
  } = useServiceOrderDetail(order.id || "");
  if (isLoading) return <DetailsSkeleton />;
  if (isError || !serviceOrderDetail) return <ErrorState />;

  const renderTimeline = () => {
    return (
      <div className="space-y-2 rounded-md bg-muted p-3 text-xs">
        {/* 1. Scheduled */}
        {serviceOrderDetail.scheduledAt && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground w-16">Lịch hẹn:</span>
            <span className="font-medium text-accent-foreground">
              {format(
                new Date(serviceOrderDetail.scheduledAt),
                "HH:mm - dd/MM/yyyy",
                {
                  locale: vi,
                }
              )}
            </span>
          </div>
        )}

        {/* 2. Performed (Đang/Đã thực hiện) */}
        {serviceOrderDetail.performedAt && (
          <div className="flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-muted-foreground w-16">Thực hiện:</span>
            <span className="font-medium text-accent-foreground">
              {format(
                new Date(serviceOrderDetail.performedAt),
                "HH:mm - dd/MM/yyyy",
                {
                  locale: vi,
                }
              )}
            </span>
          </div>
        )}

        {/* 3. Completed */}
        {serviceOrderDetail.completedAt && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span className="text-muted-foreground w-16">Hoàn tất:</span>
            <span className="font-medium text-accent-foreground ">
              {format(
                new Date(serviceOrderDetail.completedAt),
                "HH:mm - dd/MM/yyyy",
                {
                  locale: vi,
                }
              )}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-1">
      {/* SECTION 1: TIMELINE & CONTEXT */}
      <div className="grid grid-cols-1 gap-3">
        {renderTimeline()}

        {/* Context Info (Room & Staff) */}
        <div className="flex items-center justify-between gap-2 px-1">
          {bookingDetail ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent-foreground" />
              <span>
                Phòng:{" "}
                {bookingDetail.rooms.map((room) => room.roomName).join(", ")}
              </span>{" "}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-accent-foreground">
              <MapPin className="h-3.5 w-3.5" />{" "}
              <span>Tại sảnh / Khách lẻ</span>
            </div>
          )}

          {serviceOrderDetail.assignedToStaffId && (
            <Badge
              variant="secondary"
              className="h-5 px-2 text-[10px] font-normal flex gap-1"
            >
              <User className="h-3 w-3" />
              Staff: {serviceOrderDetail.assignedToStaffId.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </div>

      <Separator className="border-dashed opacity-60" />

      <CurrencyView amount={serviceOrderDetail.total}>
        {/* SECTION 2: FINANCIAL BREAKDOWN (The Receipt) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-accent-foreground mb-2">
            <Receipt className="h-3.5 w-3.5" /> Chi tiết thanh toán
          </div>

          {/* Base Cost */}
          <Row
            label="Đơn giá"
            value={formatMoney(serviceOrderDetail.unitPrice).vndFormatted}
          />
          <Row
            label="Số lượng"
            value={`x ${serviceOrderDetail.quantity}`}
            valueClass="font-bold"
          />

          {/* Surcharges & Discounts */}
          {serviceOrderDetail.discountAmount > 0 && (
            <Row
              label="Giảm giá"
              value={`-${formatMoney(serviceOrderDetail.discountAmount).vndFormatted}`}
              valueClass="text-destructive"
            />
          )}

          {serviceOrderDetail.serviceChargeAmount > 0 && (
            <Row
              label="Phí dịch vụ (SVC)"
              value={`+${formatMoney(serviceOrderDetail.serviceChargeAmount).vndFormatted}`}
              valueClass="text-muted-foreground"
            />
          )}

          {serviceOrderDetail.vatAmount > 0 && (
            <Row
              label="Thuế (VAT)"
              value={`+${formatMoney(serviceOrderDetail.vatAmount).vndFormatted}`}
              valueClass="text-muted-foreground"
            />
          )}

          <Separator className="my-2 bg-muted" />
          {/* FINAL TOTAL */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-accent-foreground">
              Tổng cộng
            </span>
            <span className="text-lg font-extrabold text-primary">
              {formatMoney(serviceOrderDetail.total).vndFormatted}
            </span>
          </div>

          {/* Currency Conversion */}
          <Separator className="my-2 bg-muted" />
          <ServiceOrderCurrencySection />
        </div>
      </CurrencyView>

      {/* SECTION 3: NOTE */}
      {serviceOrderDetail.note && (
        <div className="mt-2 rounded-md border border-amber-100 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/50 p-2.5 text-xs text-amber-800 dark:text-amber-200">
          <span className="font-semibold mr-1">Ghi chú:</span>
          <span className="italic">{serviceOrderDetail.note}</span>
        </div>
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={cn("font-medium text-accent-foreground", valueClass)}>
        {value}
      </span>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-3 p-2">
      <Skeleton className="h-20 w-full rounded-md" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-px w-full my-2" />
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-md">
      <AlertCircle className="h-4 w-4" /> Không thể tải chi tiết đơn hàng
    </div>
  );
}
