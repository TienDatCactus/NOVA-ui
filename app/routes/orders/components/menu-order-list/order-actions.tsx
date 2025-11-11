import { Ban, Clock, CreditCard, Plus, Printer } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import type { POSOrderPrintDataDto } from "~/services/api/orders/dto";
import { OrderSchema } from "~/services/api/orders/order.schema";
import {
  useAddSingleItemToPOSOrder,
  useCancelPOSOrder,
  usePayPOSOrderNow,
  usePrintPOSOrder,
  useUpdateScheduledTime,
} from "../../container/pos-orders/mutation.hooks";
import PaymentOrderSheet from "../payment-order.sheet";
import AddMenuItemDialog from "./add-menu-item.dialog";
import PrintPreviewDialog from "./print-preview.dialog";
import UpdateScheduleDialog from "./update-schedule.dialog";
import { toast } from "sonner";

const { OrderPayNowRequestSchema } = OrderSchema;

type PaymentFormData = z.infer<typeof OrderPayNowRequestSchema>;

interface OrderActionsProps {
  orderId: string;
  status: "Open" | "Completed" | "Cancelled";
  totalAmount: number;
  currentScheduledTime?: string | null;
}

export default function OrderActions({
  orderId,
  status,
  totalAmount,
  currentScheduledTime,
}: OrderActionsProps) {
  const [isPaySheetOpen, setIsPaySheetOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<POSOrderPrintDataDto | null>(null);

  const { mutate: onPayNow, isPending: isPayingNow } = usePayPOSOrderNow();
  const { mutate: onPrint, isPending: isPrintLoading } = usePrintPOSOrder();
  const { mutate: onCancel } = useCancelPOSOrder();
  // const { mutate: onComplete } = useCompletePOSOrder();
  const { mutate: onAddItem, isPending: isAddingItem } =
    useAddSingleItemToPOSOrder();
  const { mutate: onUpdateSchedule, isPending: isUpdatingSchedule } =
    useUpdateScheduledTime();

  const handlePayNow = (data: PaymentFormData) => {
    onPayNow(
      {
        orderId,
        data: {
          ...data,
          transactionReference: data.transactionReference || "",
        },
      },
      {
        onSuccess: () => {
          setIsPaySheetOpen(false);
        },
        onError: () => {
          toast.error("Thanh toán thất bại. Vui lòng thử lại.");
        },
      }
    );
  };

  const handlePrintClick = () => {
    onPrint(orderId, {
      onSuccess: (data) => {
        setPrintData(data);
        setIsPrintDialogOpen(true);
      },
    });
  };

  const handleAddItem = (
    menuItemId: string,
    quantity: number,
    unitPrice: number
  ) => {
    onAddItem(
      {
        orderId,
        data: {
          menuItemId,
          quantity,
          unitPrice,
        },
      },
      {
        onSuccess: () => {
          setIsAddItemDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateSchedule = (scheduledAt: Date) => {
    onUpdateSchedule(
      {
        orderId,
        scheduledAt,
      },
      {
        onSuccess: () => {
          setIsScheduleDialogOpen(false);
        },
      }
    );
  };
  const canComplete = status === "Open";
  const canCancel = status === "Open";
  const canReschedule = status === "Open";
  const canPay = status === "Open";
  const canAdd = status === "Open";
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Print - Available for all orders */}
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrintClick}
          disabled={isPrintLoading}
        >
          <Printer className="w-4 h-4 mr-2" />
          {isPrintLoading ? "Đang tải..." : "In"}
        </Button>

        {/* Actions for Open orders only */}

        {/* Add Items Button */}
        {canAdd && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddItemDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm món
          </Button>
        )}
        {canReschedule && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsScheduleDialogOpen(true)}
            disabled={isUpdatingSchedule}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isUpdatingSchedule ? "Đang cập nhật..." : "Đổi giờ"}
          </Button>
        )}

        {canPay && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setIsPaySheetOpen(true)}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán
          </Button>
        )}
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive-outline">
                <Ban className="w-4 h-4 mr-2" />
                Hủy đơn
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy và không
                  thể sửa đổi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Quay lại</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(orderId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hủy đơn
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {/* Cancel Order */}

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        printData={printData}
        onPrint={() => setIsPrintDialogOpen(false)}
      />

      {/* Payment Order Sheet */}
      <PaymentOrderSheet
        open={isPaySheetOpen}
        onOpenChange={setIsPaySheetOpen}
        orderId={orderId}
        onPayNow={handlePayNow}
        isPaying={isPayingNow}
        orderType="menu"
      />

      {/* Add Menu Item Dialog */}
      <AddMenuItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onConfirm={handleAddItem}
        isAdding={isAddingItem}
      />

      {/* Update Schedule Dialog */}
      <UpdateScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onConfirm={handleUpdateSchedule}
        currentScheduledTime={currentScheduledTime}
      />
    </>
  );
}
