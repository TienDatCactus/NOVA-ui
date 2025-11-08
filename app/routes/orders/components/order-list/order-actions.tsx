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
import { Ban, CheckCircle, Printer, CreditCard } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  useCancelOrder,
  useCompleteOrder,
  usePayNow,
  usePrintOrder,
} from "../../container/order-list/mutation.hooks";
import PrintPreviewDialog from "./print-preview.dialog";
import type { POSOrderPrintDataDto } from "~/services/api/orders/dto";

interface OrderActionsProps {
  orderId: string;
  status: "Open" | "Completed" | "Cancelled";
  totalAmount: number;
}

export default function OrderActions({
  orderId,
  status,
  totalAmount,
}: OrderActionsProps) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState(totalAmount);
  const [transactionRef, setTransactionRef] = useState("");
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<POSOrderPrintDataDto | null>(null);

  const { mutate: onPayNow } = usePayNow();
  const { mutate: onPrint, isPending: isPrintLoading } = usePrintOrder();
  const { mutate: onCancel } = useCancelOrder();
  const { mutate: onComplete } = useCompleteOrder();

  const handlePayNow = () => {
    onPayNow({
      orderId,
      data: {
        paymentMethod,
        paidAmount,
        transactionReference: transactionRef,
      },
    });
    setIsPayDialogOpen(false);
  };

  const handlePrintClick = () => {
    onPrint(orderId, {
      onSuccess: (data) => {
        setPrintData(data);
        setIsPrintDialogOpen(true);
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Print - Available for all orders */}
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrintClick}
          disabled={isPrintLoading}
        >
          <Printer className="w-4 h-4 mr-2" />
          {isPrintLoading ? "Đang tải..." : "In"}
        </Button>

        {/* Actions for Open orders only */}
        {status === "Open" && (
          <>
            {/* Pay Now Dialog */}
            <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toán
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Phương thức</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Tiền mặt</SelectItem>
                        <SelectItem value="Card">Thẻ</SelectItem>
                        <SelectItem value="Transfer">Chuyển khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Số tiền</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionRef">Mã giao dịch</Label>
                    <Input
                      id="transactionRef"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Nhập mã giao dịch (nếu có)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPayDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handlePayNow}>Xác nhận</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Complete Order */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hoàn thành
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hoàn thành đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xác nhận rằng tất cả các món đã được phục vụ và đơn hàng đã
                    hoàn tất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onComplete(orderId)}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Order */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Hủy đơn
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy và
                    không thể sửa đổi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(orderId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Hủy đơn
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        printData={printData}
        onPrint={() => setIsPrintDialogOpen(false)}
      />
    </>
  );
}
