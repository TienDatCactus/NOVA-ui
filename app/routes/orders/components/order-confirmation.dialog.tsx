import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CheckCircle2, Printer, Receipt } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";

type OrderConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderTotal: number;
  itemCount: number;
  customerInfo: string;
  onNewOrder: () => void;
  onPrintReceipt?: () => void;
};

export default function OrderConfirmationDialog({
  open,
  onOpenChange,
  orderId,
  orderTotal,
  itemCount,
  customerInfo,
  onNewOrder,
  onPrintReceipt,
}: OrderConfirmationDialogProps) {
  const handleNewOrder = () => {
    onNewOrder();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Đơn hàng thành công!
              </DialogTitle>
              <DialogDescription>
                Đơn hàng đã được tạo và sẵn sàng xử lý
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mã đơn hàng</span>
              <Badge variant="outline" className="font-mono text-base">
                {orderId}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Khách hàng</span>
              <span className="text-sm font-medium">{customerInfo}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Số món</span>
              <span className="text-sm font-mono font-semibold">
                {itemCount}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Tổng tiền</span>
              <data
                value={orderTotal}
                className="text-lg font-bold text-primary font-mono"
              >
                {formatMoney(orderTotal).vndFormatted}
              </data>
            </div>
          </div>

          {/* Info Note */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Đơn hàng đã được thêm vào hóa đơn</p>
            <p>Bếp/Bar sẽ bắt đầu chuẩn bị món</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {onPrintReceipt && (
            <Button
              variant="outline"
              onClick={onPrintReceipt}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </Button>
          )}
          <Button onClick={handleNewOrder} className="w-full">
            <Receipt className="h-4 w-4 mr-2" />
            Đơn hàng mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
