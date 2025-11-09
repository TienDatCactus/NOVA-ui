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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CreditCard, DollarSign } from "lucide-react";
import { usePayServiceOrderNow } from "../../container/service-pos/mutation.hooks";

interface PaymentDialogProps {
  orderId: string;
  totalAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHODS = [
  { value: "Cash", label: "Tiền mặt" },
  { value: "Card", label: "Thẻ" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "OTACollect", label: "OTA Thu hộ" },
  { value: "OnAccount", label: "Ghi nợ" },
];

export default function PaymentDialog({
  orderId,
  totalAmount,
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paidAmount, setPaidAmount] = useState<string>(totalAmount.toString());
  const [transactionRef, setTransactionRef] = useState<string>("");

  const payNow = usePayServiceOrderNow();

  const handleConfirm = () => {
    const amount = parseFloat(paidAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    payNow.mutate(
      {
        orderId,
        data: {
          paymentMethod: paymentMethod as any,
          paidAmount: amount,
          transactionReference: transactionRef || undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^\d.]/g, "");
    setPaidAmount(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Thanh toán ngay</DialogTitle>
          <DialogDescription>
            Thanh toán service order trong kỳ lưu trú (mid-stay payment)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total Amount Display */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
            <p className="text-2xl font-bold text-primary flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {totalAmount.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Phương thức thanh toán</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid Amount */}
          <div className="space-y-2">
            <Label htmlFor="paid-amount">Số tiền thanh toán</Label>
            <Input
              id="paid-amount"
              type="text"
              value={paidAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              startAddon={
                <span className="text-muted-foreground text-sm">₫</span>
              }
            />
            <p className="text-xs text-muted-foreground">
              Thanh toán đầy đủ: {totalAmount.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          {/* Transaction Reference */}
          {(paymentMethod === "Card" || paymentMethod === "BankTransfer") && (
            <div className="space-y-2">
              <Label htmlFor="transaction-ref">
                Mã giao dịch {paymentMethod === "Card" && "(Card Auth)"}
              </Label>
              <Input
                id="transaction-ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Nhập mã giao dịch..."
                startAddon={<CreditCard className="h-4 w-4" />}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !paidAmount || parseFloat(paidAmount) <= 0 || payNow.isPending
            }
          >
            {payNow.isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
