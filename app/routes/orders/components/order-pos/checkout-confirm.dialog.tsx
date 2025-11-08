import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import { Hotel, User, Receipt, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

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
  const [mode, setMode] = useState<CheckoutMode>("walk-in");

  const handleConfirm = () => {
    onConfirm(mode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Xác nhận đơn hàng</DialogTitle>
              <DialogDescription>
                Chọn loại khách hàng và tạo hóa đơn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số lượng món</span>
              <span className="font-mono font-semibold">{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Tổng tiền</span>
              <data
                value={subtotal}
                className="text-lg font-bold text-primary font-mono"
              >
                {formatMoney(subtotal).vndFormatted}
              </data>
            </div>
          </div>

          <Separator />

          {/* Customer Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Loại khách hàng</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as CheckoutMode)}
            >
              {/* Walk-in Option */}
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="walk-in" id="walk-in" />
                <label
                  htmlFor="walk-in"
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Khách lẻ (Walk-in)</p>
                    <p className="text-xs text-muted-foreground">
                      Thanh toán trực tiếp tại quầy
                    </p>
                  </div>
                </label>
              </div>

              {/* Booking Option */}
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="booking" id="booking" />
                <label
                  htmlFor="booking"
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Hotel className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Khách đặt phòng</p>
                    <p className="text-xs text-muted-foreground">
                      Tính vào hóa đơn phòng
                    </p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Info Alert */}
          {mode === "booking" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Bạn sẽ chọn booking trong bước tiếp theo
              </AlertDescription>
            </Alert>
          )}

          {mode === "walk-in" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Bạn sẽ nhập thông tin khách trong bước tiếp theo
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
