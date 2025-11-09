import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  MoreVertical,
} from "lucide-react";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import { useState } from "react";
import UpdateScheduleDialog from "./update-schedule.dialog";
import PaymentDialog from "./payment.dialog";
import {
  useCompleteServiceOrder,
  useCancelServiceOrder,
} from "../../container/service-pos/mutation.hooks";

interface ServiceOrderActionsProps {
  order: ServiceOrderDetailDto;
}

export default function ServiceOrderActions({
  order,
}: ServiceOrderActionsProps) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const completeOrder = useCompleteServiceOrder();
  const cancelOrder = useCancelServiceOrder();

  const canComplete = order.status === "Scheduled";
  const canCancel = order.status === "Scheduled";
  const canReschedule = order.status === "Scheduled";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canComplete && (
            <DropdownMenuItem
              onClick={() => completeOrder.mutate(order.id)}
              disabled={completeOrder.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Hoàn thành
            </DropdownMenuItem>
          )}

          {canReschedule && (
            <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Đổi lịch hẹn
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Thanh toán ngay
          </DropdownMenuItem>

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => cancelOrder.mutate(order.id)}
                disabled={cancelOrder.isPending}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy service
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showScheduleDialog && (
        <UpdateScheduleDialog
          orderId={order.id}
          currentScheduledTime={order.scheduledAt}
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />
      )}

      {showPaymentDialog && (
        <PaymentDialog
          orderId={order.id}
          totalAmount={order.total}
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
        />
      )}
    </>
  );
}
