import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { CheckCircle, XCircle } from "lucide-react";
import PosItemRow from "./pos-item-row";
import {
  useCompletePOSOrder,
  useCancelPOSOrder,
} from "../container/pos-orders-mutation.hooks";
import type { POSOrderDetailDto } from "~/services/api/order/dto";
import { useNavigate } from "react-router";

interface OrderCartProps {
  orderId: string;
  order: POSOrderDetailDto;
  isEditable: boolean;
}

export default function OrderCart({
  orderId,
  order,
  isEditable,
}: OrderCartProps) {
  const navigate = useNavigate();
  const completeMutation = useCompletePOSOrder();
  const cancelMutation = useCancelPOSOrder();

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(orderId);
      // Success toast handled by mutation hook
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(orderId);
      navigate("/dashboard/pos-orders");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const isCompleted = order.status === "Completed";
  const isCancelled = order.status === "Cancelled";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Đơn hàng</span>
          <span className="text-sm font-normal text-muted-foreground">
            {order.items.length} món
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          {order.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có món nào trong đơn hàng
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Chọn món từ thực đơn bên trái để bắt đầu
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {order.items.map((item) => (
                <PosItemRow
                  key={item.id}
                  item={item}
                  orderId={orderId}
                  isEditable={isEditable}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Summary */}
      <CardContent className="space-y-3 py-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-medium">
            {order.totalAmount.toLocaleString()} VNĐ
          </span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="text-lg font-semibold">Tổng cộng</span>
          <span className="text-2xl font-bold text-primary">
            {order.totalAmount.toLocaleString()} VNĐ
          </span>
        </div>
      </CardContent>

      {/* Actions */}
      {isEditable && (
        <CardFooter className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            {cancelMutation.isPending ? (
              <>Đang hủy...</>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Hủy đơn
              </>
            )}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending || order.items.length === 0}
            className="flex-1"
          >
            {completeMutation.isPending ? (
              <>Đang xử lý...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Hoàn thành
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
