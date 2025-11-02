import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CreditCard,
  Package,
  Plus,
  Printer,
  Receipt,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { formatMoney } from "~/lib/utils";
import { usePOSOrderDetail } from "../container/pos-orders-query.hooks";
import {
  useCompletePOSOrder,
  useCancelPOSOrder,
  useDeleteItemFromPOSOrder,
} from "../container/pos-orders-mutation.hooks";
import AddItemToPOSOrderDialog from "./add-item.dialog";
import PrintOrderDialog from "./print-order.dialog";

interface POSOrderDetailSheetProps {
  orderId: string;
  trigger?: React.ReactNode;
}

function POSOrderDetailSheet({ orderId, trigger }: POSOrderDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const { data, isPending, error, refetch } = usePOSOrderDetail(orderId, open);
  const completeMutation = useCompletePOSOrder();
  const cancelMutation = useCancelPOSOrder();
  const deleteItemMutation = useDeleteItemFromPOSOrder();

  const handleComplete = async () => {
    await completeMutation.mutateAsync(orderId);
    setOpen(false);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(orderId);
    setOpen(false);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await deleteItemMutation.mutateAsync({
        orderId,
        itemId: deleteItemId,
      });
      refetch();
      setDeleteItemId(null);
    } catch (error) {
      console.error("Delete item error:", error);
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    const statusMap: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return statusMap[status.toLowerCase()] || "secondary";
  };

  const getStatusText = (status: string): string => {
    const statusTextMap: Record<string, string> = {
      pending: "Đang chờ",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusTextMap[status.toLowerCase()] || status;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline">Xem chi tiết</Button>}
      </SheetTrigger>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-48" />
                ) : (
                  `Đơn hàng ${orderId.slice(0, 8)}...`
                )}
              </SheetTitle>
              <SheetDescription>
                {error && "Không thể tải thông tin đơn hàng"}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {data && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrintDialogOpen(true)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    In đơn
                  </Button>
                  <Badge variant={getStatusVariant(data.status)}>
                    {getStatusText(data.status)}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        {isPending && (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-destructive">
              Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại.
            </p>
          </div>
        )}

        {data && (
          <div className="flex-1 space-y-6 overflow-y-auto bg-background p-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-mono">{data.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mã hóa đơn:</span>
                  <span className="font-mono">{data.invoiceId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mã khách hàng:</span>
                  <span className="font-mono">{data.customerId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>
                    {format(new Date(data.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-4 w-4" />
                    Danh sách món ({data.items.length})
                  </CardTitle>
                  {data.status.toLowerCase() === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => setAddItemDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm món
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên món</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      {data.status.toLowerCase() === "pending" && (
                        <TableHead className="w-12"></TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item, index) => {
                      const { vndFormatted: unitPrice } = formatMoney(
                        item.unitPrice
                      );
                      const { vndFormatted: subtotal } = formatMoney(
                        item.subtotal
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {item.menuItemName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {unitPrice}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {subtotal}
                          </TableCell>
                          {data.status.toLowerCase() === "pending" && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteItemId(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Total */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatMoney(data.totalAmount).vndFormatted}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {data.status.toLowerCase() === "pending" && (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending
                    ? "Đang xử lý..."
                    : "Hoàn thành đơn"}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>

      {/* Add Item Dialog */}
      <AddItemToPOSOrderDialog
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        orderId={orderId}
        onSuccess={() => refetch()}
      />

      {/* Print Order Dialog */}
      <PrintOrderDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        orderId={orderId}
      />

      {/* Delete Item Confirmation */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa món</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa món này khỏi đơn hàng? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItemMutation.isPending ? "Đang xóa..." : "Xóa món"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

export default POSOrderDetailSheet;
