import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Receipt,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn, formatMoney } from "~/lib/utils";

type CheckoutMode = "walk-in" | "booking";

type CheckoutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  itemCount: number;
  onConfirm: (mode: CheckoutMode) => void;
  isSubmitting?: boolean;
};

export default function CheckoutConfirmDialog({
  open,
  onOpenChange,
  subtotal,
  itemCount,
  onConfirm,
  isSubmitting = false,
}: CheckoutConfirmDialogProps) {
  const [mode, setMode] = useState<CheckoutMode>("booking");
  const { pathname } = useLocation();

  // Logic: Disable walk-in for specific routes if needed
  const isWalkInDisabled = pathname.includes("service-pos");

  const handleConfirm = () => {
    onConfirm(mode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden outline-none">
        <DialogHeader className="px-6 py-5 border-b bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Xác nhận đơn hàng
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. HERO TOTAL SECTION */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tổng thanh toán ({itemCount} món)
            </span>
            <span className="text-4xl font-bold text-primary tracking-tight font-mono">
              {formatMoney(subtotal).vndFormatted}
            </span>
          </div>

          {/* 2. SELECTION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION A: WALK-IN */}
            <button
              type="button"
              disabled={isWalkInDisabled}
              onClick={() => setMode("walk-in")}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 outline-none",
                mode === "walk-in"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30",
                isWalkInDisabled && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  mode === "walk-in"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Wallet className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-sm">Khách Lẻ</span>
                <p className="text-xs text-muted-foreground leading-snug">
                  Thanh toán ngay tại quầy. Không liên kết phòng.
                </p>
              </div>
              {/* Checkmark Badge */}
              {mode === "walk-in" && (
                <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                  <CheckCircle2 className="h-5 w-5 fill-primary/10" />
                </div>
              )}
            </button>

            {/* OPTION B: BOOKING */}
            <button
              type="button"
              onClick={() => setMode("booking")}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 outline-none",
                mode === "booking"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  mode === "booking"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <BedDouble className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-sm">Khách Lưu Trú</span>
                <p className="text-xs text-muted-foreground leading-snug">
                  Ghi nợ vào hóa đơn phòng hoặc booking hiện tại.
                </p>
              </div>
              {mode === "booking" && (
                <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                  <CheckCircle2 className="h-5 w-5 fill-primary/10" />
                </div>
              )}
            </button>
          </div>

          {/* 3. CONTEXTUAL HINT */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 flex items-start gap-3 text-xs text-blue-700 dark:text-blue-300">
            <div className="mt-0.5 shrink-0">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <p>
              {mode === "walk-in"
                ? "Bước tiếp theo: Chọn thời gian phục vụ và xác nhận thanh toán."
                : "Bước tiếp theo: Chọn phòng/booking để gán đơn hàng."}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/5 border-t sm:justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="min-w-[140px] shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              "Đang xử lý..."
            ) : (
              <>
                Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
