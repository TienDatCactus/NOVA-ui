import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { usePOSOrderPrintData } from "./container/pos-orders-query.hooks";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { Route } from "./+types/print";

export default function Component({}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { posId } = useParams();

  const {
    data: printData,
    isPending,
    isError,
  } = usePOSOrderPrintData(posId || "");

  // Auto-open print dialog when data loads
  useEffect(() => {
    if (printData && !isPending) {
      // Small delay to ensure page is rendered
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printData, isPending]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Đang tải dữ liệu in...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !printData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-semibold text-destructive">
              Không thể tải dữ liệu in
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vui lòng thử lại sau
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/pos-orders/${posId}`)}
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dashboard/pos-orders/${posId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            In
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="mx-auto max-w-3xl p-8 print:p-4">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-0">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">NOVA Hotel</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Hóa Đơn Dịch Vụ / Service Bill
              </p>
            </div>

            <Separator className="my-6" />

            {/* Order Info */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Số đơn hàng:</span>
                <span>{printData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ngày giờ:</span>
                <span>
                  {format(parseISO(printData.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </span>
              </div>
              {printData.tableNumber && (
                <div className="flex justify-between">
                  <span className="font-medium">Số bàn:</span>
                  <span>{printData.tableNumber}</span>
                </div>
              )}
              {printData.customerName && (
                <div className="flex justify-between">
                  <span className="font-medium">Khách hàng:</span>
                  <span>{printData.customerName}</span>
                </div>
              )}
              {printData.roomName && (
                <div className="flex justify-between">
                  <span className="font-medium">Phòng:</span>
                  <span>{printData.roomName}</span>
                </div>
              )}
              {printData.bookingCode && (
                <div className="flex justify-between">
                  <span className="font-medium">Mã đặt phòng:</span>
                  <span>{printData.bookingCode}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Món</th>
                    <th className="pb-2 text-center font-medium">SL</th>
                    <th className="pb-2 text-right font-medium">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {printData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.itemName}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right text-sm text-muted-foreground">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-6" />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{printData.totalAmount.toLocaleString()} VNĐ</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p className="mt-2">Thank you for using our service!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
            size: A5;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          * {
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
