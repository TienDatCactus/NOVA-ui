import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarClock,
  Clock,
  Receipt,
  StickyNote,
  User,
  BedDouble,
  CreditCard,
  MoreVertical,
  Printer,
  X,
  Hash,
  ChevronRight,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { cn, formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";

import OrderItemsList from "./order-items-list";
import {
  OrderActionMenu,
  OrderAddButton,
  OrderFooterActions,
} from "./order-actions";
import InlineNoteEditor from "./inline-note-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface OrderDetailSheetProps {
  order: POSOrderDetailDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Professional, high-contrast status styles
const statusStyles: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  Processing:
    "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
  Completed:
    "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
};

const statusLabels: Record<string, string> = {
  Open: "Mới",
  Processing: "Đang xử lý",
  Completed: "Hoàn tất",
  Cancelled: "Đã hủy",
};

export default function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  if (!order) return null;

  const statusStyle = statusStyles[order.status] || statusStyles.Open;
  const statusLabel = statusLabels[order.status] || order.status;

  const isCustomerInHouse = order.customerType === "In-House";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col gap-0 "
      >
        {/* === 1. HEADER: Identification & Status === */}
        <SheetHeader className="flex-none px-6 py-5 border-b bg-background z-10 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-2">
            <SheetTitle className="text-xl font-bold tracking-tight font-mono">
              #{order.id.slice(-6).toUpperCase()}
            </SheetTitle>
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2.5 py-0.5 text-xs font-semibold border uppercase tracking-wide",
                statusStyle
              )}
            >
              {statusLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-1 -mr-2">
            <OrderActionMenu
              orderId={order.id}
              status={order.status}
              currentScheduledTime={order.scheduledAt}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* === 2. SCROLLABLE CONTENT === */}
        <ScrollArea className="flex-1 bg-muted/10">
          <div className="flex flex-col">
            {/* A. CONTEXT GRID (Property-style) */}
            <div className="grid grid-cols-2 divide-x border-b bg-background">
              {/* Left: Customer */}
              <div className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {isCustomerInHouse ? (
                    <BedDouble className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Khách hàng
                  </span>
                </div>
                <div className="font-medium text-sm pl-6">
                  {isCustomerInHouse ? "Khách phòng" : "Khách lẻ"}
                  {order.customerId && (
                    <span className="block text-xs text-muted-foreground font-mono mt-0.5">
                      {order.customerId.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Timing */}
              <div className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {order.scheduledAt ? (
                    <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Thời gian
                  </span>
                </div>
                <div className="font-medium text-sm pl-6">
                  {order.scheduledAt ? (
                    <span className="text-amber-700 font-semibold">
                      {format(parseISO(order.scheduledAt), "HH:mm dd/MM")}
                    </span>
                  ) : (
                    <span>
                      {format(parseISO(order.createdAt), "HH:mm dd/MM")}
                    </span>
                  )}
                  {order.scheduledAt && (
                    <span className="block text-xs text-amber-600/80">
                      (Đã hẹn giờ)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* B. NOTE SECTION (If exists or editable) */}
            <div className="px-6 py-4 border-b bg-background">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Ghi chú nội bộ
                </span>
              </div>
              <InlineNoteEditor
                orderId={order.id}
                initialNote={order.note || ""}
                disabled={order.status !== "Open"}
              />
            </div>

            {/* C. ORDER ITEMS */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" /> Danh sách món (
                  {order.items?.length || 0})
                </h3>
                {order.status === "Open" && (
                  <OrderAddButton orderId={order.id} status={order.status} />
                )}
              </div>

              {/* Items List Component */}
              <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
                <OrderItemsList items={order.items || []} />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* === 3. FOOTER: FINANCIALS === */}
        <div className="flex-none bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="p-6 space-y-4">
            {/* Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tổng tiền hàng</span>
                <span className="font-mono text-foreground">
                  {formatMoney(order.subtotalAmount).vndFormatted}
                </span>
              </div>

              {(order.serviceChargeAmount > 0 || order.vatAmount > 0) && (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Phí dịch vụ & Khác</span>
                    <span className="font-mono text-foreground">
                      {formatMoney(order.serviceChargeAmount).vndFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>VAT</span>
                    <span className="font-mono text-foreground">
                      {formatMoney(order.vatAmount).vndFormatted}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Separator className="my-2" />

            {/* Grand Total & Invoice */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thanh toán
                </span>
                {order.invoiceId ? (
                  <Badge
                    variant="secondary"
                    className="w-fit font-mono text-[10px] px-1.5 h-5"
                  >
                    INV: {order.invoiceId}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">
                    Chưa xuất hóa đơn
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary font-mono">
                {formatMoney(order.totalAmount).vndFormatted}
              </span>
            </div>

            {/* Main Action */}
            <div className="pt-2">
              <OrderFooterActions
                orderId={order.id}
                status={order.status}
                invoiceId={order.invoiceId}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
