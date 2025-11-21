import { Button } from "~/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import { useState } from "react";
import PaymentOrderSheet from "../payment-order.sheet";
import {
  useCompleteServiceOrder,
  useCancelServiceOrder,
  usePayServiceOrderNow,
  useUpdateServiceOrderSchedule,
} from "../../container/service-order/mutation.hooks";
import { useServiceOrderDetail } from "../../container/service-order/query.hooks";
import { toast } from "sonner";
import type { PaymentSchema } from "~/services/schema/payment.schema";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";
import UpdateScheduleDialog from "../update-schedule.dialog";

const { OrderPayNowRequestSchema } = OrderSchema;

type PaymentFormData = z.infer<typeof OrderPayNowRequestSchema>;
interface ServiceOrderActionsProps {
  orderId: string;
}

export default function ServiceOrderActions({
  orderId,
}: ServiceOrderActionsProps) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: order, isLoading } = useServiceOrderDetail(orderId, {
    enabled: true,
  });
  const completeOrder = useCompleteServiceOrder();
  const cancelOrder = useCancelServiceOrder();
  const payNow = usePayServiceOrderNow();
  const updateSchedule = useUpdateServiceOrderSchedule();

  const canComplete = order?.status === "Scheduled";
  const canCancel = order?.status === "Scheduled";
  const canReschedule = order?.status === "Scheduled";
  const canPay = order?.status === "Scheduled";
  const handlePayNow = (data: PaymentFormData) => {
    payNow.mutate(
      {
        orderId,
        data,
      },
      {
        onSuccess: () => {
          toast.success("Thanh toán thành công!");
          setShowPaymentDialog(false);
        },
        onError: () => {
          toast.error("Thanh toán thất bại. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleUpdateSchedule = (scheduledAt: Date) => {
    updateSchedule.mutate(
      {
        orderId,
        scheduledAt,
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật thời gian phục vụ!");
          setShowScheduleDialog(false);
        },
        onError: () => {
          toast.error("Cập nhật thất bại. Vui lòng thử lại.");
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Button variant="ghost" size="sm" disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Đang tải...
          </Button>
        ) : !order ? (
          <Button variant="ghost" size="sm" disabled>
            Lỗi tải dữ liệu
          </Button>
        ) : (
          <>
            {canReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowScheduleDialog(true);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Đổi lịch
              </Button>
            )}
            {canComplete && (
              <Button
                variant="success"
                size="sm"
                onClick={() => completeOrder.mutate(order.id)}
                disabled={completeOrder.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Hoàn thành
              </Button>
            )}
            {canPay && (
              <Button
                variant="info"
                size="sm"
                onClick={() => {
                  setShowPaymentDialog(true);
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Thanh toán
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => cancelOrder.mutate(order.id)}
                disabled={cancelOrder.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy đơn
              </Button>
            )}
          </>
        )}
      </div>

      {order && showScheduleDialog && (
        <UpdateScheduleDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          onConfirm={handleUpdateSchedule}
          currentScheduledTime={order.scheduledAt}
        />
      )}

      {order && showPaymentDialog && (
        <PaymentOrderSheet
          orderId={order.id}
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onPayNow={handlePayNow}
          isPaying={payNow.isPending}
          orderType="service"
        />
      )}
    </>
  );
}
