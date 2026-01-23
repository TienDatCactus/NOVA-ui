import {
  Ban,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MoreVertical,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { buildPaymentCallbackUrls } from "~/lib/payment-url-builder";
import type { ServiceOrderPayNowRequestDto } from "~/services/api/orders/dto";
import {
  useCancelServiceOrder,
  useCompleteServiceOrder,
  usePayServiceOrderNow,
  useUpdateServiceOrderSchedule,
} from "../../container/service-order/mutation.hooks";
import PaymentOrderSheet from "../payment-order.sheet";
import UpdateScheduleDialog from "../update-schedule.dialog";

// Giả định type

interface ActionProps {
  orderId: string;
  status: string;
  currentScheduledTime?: string | null;
}

// --- LOGIC HOOK ---
function useServiceOrderLogic({ orderId }: { orderId: string }) {
  const [dialogs, setDialogs] = useState({
    pay: false,
    schedule: false,
  });

  const toggle = (key: keyof typeof dialogs, value: boolean) =>
    setDialogs((prev) => ({ ...prev, [key]: value }));

  const completeOrder = useCompleteServiceOrder();
  const cancelOrder = useCancelServiceOrder();
  const payNow = usePayServiceOrderNow();
  const updateSchedule = useUpdateServiceOrderSchedule();

  const handlers = {
    handleComplete: () =>
      completeOrder.mutate(orderId, {
        onSuccess: () => toast.success("Dịch vụ đã hoàn thành!"),
      }),
    handleCancel: () =>
      cancelOrder.mutate(orderId, {
        onSuccess: () => toast.success("Đã hủy dịch vụ"),
      }),
    handlePay: (data: ServiceOrderPayNowRequestDto) => {
      // Build payment callback URLs for gateway redirects
      const { successUrl, cancelUrl } = buildPaymentCallbackUrls({
        type: "service-order",
        id: orderId,
      });

      payNow.mutate(
        {
          orderId,
          data: {
            ...data,
            successUrl,
            cancelUrl,
            description: `Thanh toán service order ${orderId.slice(0, 8)}`,
          },
        },
        {
          onSuccess: () => {
            toggle("pay", false);
            toast.success("Thanh toán thành công!");
          },
        },
      );
    },
    handleUpdateSchedule: (date: string) => {
      updateSchedule.mutate(
        { orderId, scheduledAt: date },
        {
          onSuccess: () => {
            toggle("schedule", false);
          },
        },
      );
    },
  };

  return {
    dialogs,
    toggle,
    handlers,
    loading: {
      isCompleting: completeOrder.isPending,
      isPaying: payNow.isPending,
      isCancelling: cancelOrder.isPending,
    },
  };
}

// --- COMPONENTS ---

/**
 * 1. Menu góc trên: Chứa các tác vụ phụ hoặc tác vụ quản lý
 */
export function ServiceActionMenu({
  orderId,
  status,
  currentScheduledTime,
}: ActionProps) {
  const { dialogs, toggle, handlers } = useServiceOrderLogic({
    orderId,
  });
  const isEditable = status === "Scheduled";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-900"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quản lý dịch vụ</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={!isEditable}
            onClick={() => toggle("schedule", true)}
          >
            <CalendarClock className="mr-2 h-4 w-4" /> Đổi lịch hẹn
          </DropdownMenuItem>

          {isEditable && (
            <>
              <DropdownMenuSeparator />
              {/* Trigger Cancel Logic */}
              <DropdownMenuItem
                variant="destructive"
                onClick={handlers.handleCancel}
              >
                <Ban className="mr-2 h-4 w-4" /> Hủy dịch vụ
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {dialogs.schedule && (
        <UpdateScheduleDialog
          open={dialogs.schedule}
          onOpenChange={(v) => toggle("schedule", v)}
          onConfirm={handlers.handleUpdateSchedule}
          currentScheduledTime={currentScheduledTime}
        />
      )}
    </>
  );
}

/**
 * 2. Footer Actions: Các nút hành động chính to, rõ ràng
 */
export function ServiceFooterActions({ orderId, status }: ActionProps) {
  const { dialogs, toggle, handlers, loading } = useServiceOrderLogic({
    orderId,
  });

  if (status === "Completed") {
    return (
      <>
        <div className="flex items-center justify-center w-full py-2 bg-green-50 text-green-700 dark:bg-green-900/50 text-sm font-medium rounded border border-green-200 dark:border-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Đã hoàn thành
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            size={"sm"}
            onClick={() => toggle("pay", true)}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Thanh toán lại
          </Button>

          <Button
            variant="success"
            size={"sm"}
            onClick={handlers.handleComplete}
            disabled={loading.isCompleting}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất
          </Button>

          {dialogs.pay && (
            <PaymentOrderSheet
              orderId={orderId}
              open={dialogs.pay}
              onOpenChange={(v) => toggle("pay", v)}
              onPayNow={handlers.handlePay}
              isPaying={loading.isPaying}
              orderType="service"
            />
          )}
        </div>
      </>
    );
  }

  if (status === "Cancelled" || status === "NoShow") {
    return (
      <div className="flex items-center justify-center w-full py-2 bg-gray-100 text-gray-500 dark:bg-gray-900/50 text-sm font-medium rounded border border-gray-200 dark:border-gray-700">
        <XCircle className="mr-2 h-4 w-4" /> Đã hủy / Không đến
      </div>
    );
  }

  // Status === "Scheduled"
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button variant="outline" size={"sm"} onClick={() => toggle("pay", true)}>
        <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
      </Button>

      <Button
        variant="success"
        size={"sm"}
        onClick={handlers.handleComplete}
        disabled={loading.isCompleting}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất
      </Button>

      {dialogs.pay && (
        <PaymentOrderSheet
          orderId={orderId}
          open={dialogs.pay}
          onOpenChange={(v) => toggle("pay", v)}
          onPayNow={handlers.handlePay}
          isPaying={loading.isPaying}
          orderType="service"
        />
      )}
    </div>
  );
}
