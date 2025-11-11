import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
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
import { formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { Clock, StickyNote, Utensils, Trash2, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useDeleteItemFromPOSOrder,
  useMarkItemServed,
} from "../../container/pos-orders/mutation.hooks";

interface OrderDetailsProps {
  order: POSOrderDetailDto;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const hasScheduledTime = order.createdAt;
  const hasNotes = false;
  const isOpen = order.status === "Open";

  const { mutate: deleteItem } = useDeleteItemFromPOSOrder();
  const { mutate: markServed, isPending: isMarkingServed } =
    useMarkItemServed();

  const handleDeleteItem = (itemId: string) => {
    deleteItem({
      orderId: order.id,
      itemId,
    });
  };

  const handleMarkServed = (itemId: string) => {
    markServed({
      orderId: order.id,
      itemId,
      servedAt: new Date(),
    });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      {/* Scheduled Time (if exists) */}
      {hasScheduledTime && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Thời gian phục vụ</p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(order.createdAt!), "HH:mm - dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Notes (if exists) */}
      {hasNotes && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ghi chú</p>
            <p className="text-sm text-muted-foreground">Ghi chú đơn hàng...</p>
          </div>
        </div>
      )}

      <Separator />

      {/* Order Items */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">
            Món ăn ({order.items?.length || 0})
          </p>
        </div>

        <div className="space-y-2">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-3 bg-background rounded-md border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.itemName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      SL: {item.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatMoney(item.unitPrice).vndFormatted}
                    </span>
                  </div>
                  {item.servedAt && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Đã phục vụ{" "}
                      {format(item.servedAt, "HH:mm", { locale: vi })}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">
                      {formatMoney(item.subtotal).vndFormatted}
                    </p>
                  </div>
                  {/* Mark as Served button for Open orders only (if not already served) */}
                  {isOpen && !item.servedAt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkServed(item.id)}
                      disabled={isMarkingServed}
                      className="h-8 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Đã phục vụ
                    </Button>
                  )}
                  {/* Delete button for Open orders only */}
                  {isOpen && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa "{item.itemName}" khỏi đơn
                            hàng? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa món
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Không có món nào
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm font-semibold">Tổng cộng</p>
        <p className="text-lg font-bold text-primary">
          {formatMoney(order.totalAmount).vndFormatted}
        </p>
      </div>
    </div>
  );
}
