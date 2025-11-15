import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Printer,
  Receipt,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { DASHBOARD } from "~/lib/fe-url";
import { formatMoney } from "~/lib/utils";

type OrderDialogStatus = "success" | "error" | "loading";

type OrderConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: OrderDialogStatus;
  orderId?: string;
  orderTotal: number;
  itemCount: number;
  customerInfo: string;
  error?: string;
  onNewOrder: () => void;
  onRetry?: () => void;
};

export default function OrderConfirmationDialog({
  open,
  onOpenChange,
  status,
  orderTotal,
  itemCount,
  customerInfo,
  error,
  onNewOrder,
  onRetry,
}: OrderConfirmationDialogProps) {
  const handleNewOrder = () => {
    onNewOrder();
    onOpenChange(false);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Render different content based on status
  const renderHeader = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <div>
              <DialogTitle className="text-xl">Đang xử lý...</DialogTitle>
              <DialogDescription>Vui lòng đợi trong giây lát</DialogDescription>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Tạo đơn thất bại!</DialogTitle>
              <DialogDescription>
                Đã có lỗi xảy ra khi tạo đơn hàng
              </DialogDescription>
            </div>
          </div>
        );

      case "success":
      default:
        return (
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
        );
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Đang tạo đơn hàng và cập nhật hóa đơn...
          </p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="space-y-4">
          {/* Error Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || "Có lỗi xảy ra. Vui lòng thử lại sau."}
            </AlertDescription>
          </Alert>

          {/* Order Info (attempted) */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
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
                className="text-lg font-bold text-muted-foreground font-mono line-through"
              >
                {formatMoney(orderTotal).vndFormatted}
              </data>
            </div>
          </div>

          {/* Error Note */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Đơn hàng chưa được tạo</p>
            <p>Vui lòng kiểm tra lại thông tin và thử lại</p>
          </div>
        </div>
      );
    }

    // Success state
    return (
      <div className="space-y-4">
        {/* Order Info */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Khách hàng</span>
            <span className="text-sm font-medium">{customerInfo}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Số món</span>
            <span className="text-sm font-mono font-semibold">{itemCount}</span>
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
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    if (status === "loading") {
      return null; // No buttons while loading
    }
    const curPath = useLocation().pathname;

    if (status === "error") {
      return (
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onRetry && (
            <Button onClick={handleRetry}>
              <Receipt className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          )}
        </DialogFooter>
      );
    }

    // Success state
    return (
      <DialogFooter className="flex justify-between gap-2">
        <Link
          to={
            curPath.includes("menu-pos")
              ? DASHBOARD.orders["menu-orders"]
              : DASHBOARD.orders["service-orders"]
          }
        >
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
        <Button variant="success" onClick={handleNewOrder}>
          <Receipt className="h-4 w-4 mr-2" />
          Đơn hàng mới
        </Button>
      </DialogFooter>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={status === "loading" ? undefined : onOpenChange}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>{renderHeader()}</DialogHeader>
        {renderContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
