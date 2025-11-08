import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import type { POSOrderPrintDataDto } from "~/services/api/orders/dto";
import { Printer, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printData: POSOrderPrintDataDto | null;
  onPrint: () => void;
}

export default function PrintPreviewDialog({
  open,
  onOpenChange,
  printData,
  onPrint,
}: PrintPreviewDialogProps) {
  if (!printData) return null;

  const handlePrint = () => {
    // Trigger browser print dialog
    window.print();
    onPrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md print:max-w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Xem trước hóa đơn</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="print:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Print Content */}
        <div className="space-y-4 py-4 print:text-black">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">HÓA ĐƠN BÁN HÀNG</h2>
            <p className="text-sm text-muted-foreground">
              NOVA Hotel & Restaurant
            </p>
            <p className="text-xs text-muted-foreground">
              Đơn hàng #{printData.orderNumber}
            </p>
          </div>

          <Separator />

          {/* Order Info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày giờ:</span>
              <span className="font-medium">
                {format(parseISO(printData.createdAt), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </span>
            </div>

            {printData.customerName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khách hàng:</span>
                <span className="font-medium">{printData.customerName}</span>
              </div>
            )}

            {printData.tableNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bàn:</span>
                <span className="font-medium">{printData.tableNumber}</span>
              </div>
            )}

            {printData.roomName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phòng:</span>
                <span className="font-medium">{printData.roomName}</span>
              </div>
            )}

            {printData.bookingCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã booking:</span>
                <span className="font-medium font-mono">
                  {printData.bookingCode}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Chi tiết đơn hàng</h3>
            <div className="space-y-2">
              {printData.items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.itemName}</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      x{item.quantity}
                    </span>
                  </div>
                  {index < printData.items.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Total */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {formatMoney(printData.totalAmount).vndFormatted}
              </span>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center space-y-1 text-xs text-muted-foreground">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
            <p>Hẹn gặp lại!</p>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            In hóa đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
