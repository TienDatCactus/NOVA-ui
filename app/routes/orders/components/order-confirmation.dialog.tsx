import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Receipt,
  RotateCcw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { DASHBOARD } from "~/lib/fe-url";
import { cn, formatMoney } from "~/lib/utils";

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
  orderId,
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

  const curPath = useLocation().pathname;
  const backLink = curPath.includes("menu-pos")
    ? DASHBOARD.orders["menuOrders"]
    : DASHBOARD.orders["serviceOrders"];

  return (
    <Dialog
      open={open}
      onOpenChange={status === "loading" ? undefined : onOpenChange}
    >
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden outline-none border-none shadow-2xl">
        {/* === CONTENT BODY === */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* 1. LOADING STATE */}
          {status === "loading" && (
            <div className="py-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  Đang xử lý đơn hàng...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Đồng bộ với bếp & kho
                </p>
              </div>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {status === "error" && (
            <div className="py-4 flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 duration-300">
              <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                <XCircle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-600">
                  Đơn hàng thất bại
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 max-w-[300px] mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-1 font-semibold">
                    <AlertCircle className="h-4 w-4" /> Chi tiết lỗi
                  </div>
                  {error || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."}
                </div>
              </div>
            </div>
          )}

          {/* 3. SUCCESS STATE */}
          {status === "success" && (
            <div className="w-full flex flex-col items-center gap-6 animate-in slide-in-from-bottom-8 duration-500">
              {/* Success Icon Animation */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-emerald-50">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Đơn hàng đã được xác nhận!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Đơn hàng đã được gửi đến bếp.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="w-full bg-card border rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      #{orderId ? orderId.slice(-6).toUpperCase() : "---"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Đã thanh toán / Chờ xử lý
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Khách hàng</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {customerInfo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Số lượng món</span>
                    <span className="font-medium flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> {itemCount}
                    </span>
                  </div>
                  <Separator className="border-dashed" />
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tổng số tiền
                    </span>
                    <span className="text-xl font-bold font-mono text-primary">
                      {formatMoney(orderTotal).vndFormatted}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === FOOTER ACTIONS === */}
        {status !== "loading" && (
          <DialogFooter className="p-4 bg-muted/20 border-t sm:justify-between gap-3">
            {status === "error" ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Đóng
                </Button>
                {onRetry && (
                  <Button
                    variant="destructive"
                    onClick={onRetry}
                    className="flex-1 gap-2 shadow-sm"
                  >
                    <RotateCcw className="h-4 w-4" /> Thử lại
                  </Button>
                )}
              </>
            ) : (
              <>
                <Link to={backLink} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed hover:border-solid hover:bg-white transition-all"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" /> Quay lại danh
                    sách đơn hàng
                  </Button>
                </Link>
                <Button
                  onClick={handleNewOrder}
                  variant={"success"}
                  className="flex-1 gap-2  shadow-md"
                >
                  <ShoppingBag className="h-4 w-4" /> Tạo đơn hàng mới
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
