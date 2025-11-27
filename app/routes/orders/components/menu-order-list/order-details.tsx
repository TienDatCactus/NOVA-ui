import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { Check, Trash2, ChefHat } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useDeleteItemFromPOSOrder,
  useMarkItemServed,
} from "../../container/pos-orders/mutation.hooks";
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

interface OrderDetailsProps {
  order: POSOrderDetailDto;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const isOpen = order.status === "Open";
  const { mutate: deleteItem } = useDeleteItemFromPOSOrder();
  const { mutate: markServed, isPending: isMarkingServed } =
    useMarkItemServed();

  const handleDelete = (itemId: string) =>
    deleteItem({ orderId: order.id, itemId });
  const handleServed = (itemId: string) =>
    markServed({ orderId: order.id, itemId, servedAt: new Date() });

  if (!order.items || order.items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400 italic">
        Chưa có món nào
      </div>
    );
  }

  return (
    <div className="space-y-1 h-32 overflow-y-auto">
      {order.items.map((item) => (
        <div
          key={item.id}
          className="group relative grid grid-cols-[auto_1fr_auto] gap-3 items-start py-2 px-1 hover:bg-gray-50 rounded-md transition-colors"
        >
          {/* Cột 1: Số lượng */}
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-700 mt-0.5">
            {item.quantity}
          </div>

          {/* Cột 2: Tên món & Meta */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {item.itemName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-400">
                {formatMoney(item.unitPrice).vndFormatted}
              </span>

              {/* Trạng thái món (Served) */}
              {item.servedAt && (
                <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                  <Check className="h-3 w-3" />{" "}
                  {format(new Date(item.servedAt), "HH:mm")}
                </span>
              )}
            </div>

            {/* INLINE ACTIONS (Chỉ hiện khi Hover) */}
            {isOpen && (
              <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 mobile:opacity-100 ">
                {!item.servedAt && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-auto px-2 text-xs text-primary border-primary hover:bg-primary/10"
                    onClick={() => handleServed(item.id)}
                    disabled={isMarkingServed}
                  >
                    <ChefHat className="mr-1 h-3 w-3" /> Báo xong
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive-ghost"
                      size="icon"
                      className="h-6 w-6 "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa món này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Không thể hoàn tác hành động này.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* Cột 3: Thành tiền */}
          <div className="text-right text-sm font-semibold text-gray-900">
            {formatMoney(item.subtotal).vndFormatted}
          </div>
        </div>
      ))}
    </div>
  );
}
