import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Printer, Receipt, UtensilsCrossed } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";
import { usePOSOrderPrintData } from "../container/pos-orders-query.hooks";

interface PrintOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export default function PrintOrderDialog({
  open,
  onOpenChange,
  orderId,
}: PrintOrderDialogProps) {
  const [activeTab, setActiveTab] = useState<"kitchen" | "receipt">("kitchen");
  const kitchenTicketRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data, isPending, error } = usePOSOrderPrintData(orderId, open);

  const handlePrint = () => {
    const printContent =
      activeTab === "kitchen" ? kitchenTicketRef.current : receiptRef.current;

    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In ${activeTab === "kitchen" ? "Phiếu bếp" : "Hóa đơn"}</title>
          <style>
            @media print {
              @page {
                margin: 10mm;
                size: ${activeTab === "kitchen" ? "80mm auto" : "80mm auto"};
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 10px;
              max-width: 80mm;
            }
            .print-container {
              width: 100%;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 18px; }
            .text-lg { font-size: 16px; }
            .text-sm { font-size: 11px; }
            .text-xs { font-size: 10px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .border-t { border-top: 1px dashed #000; }
            .border-b { border-bottom: 1px dashed #000; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .separator { 
              border-top: 1px dashed #000; 
              margin: 8px 0; 
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Delay to ensure content is fully loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            In đơn hàng
          </DialogTitle>
          <DialogDescription>
            Chọn loại phiếu in: Phiếu bếp hoặc Hóa đơn khách hàng
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="py-10 text-center text-destructive">
            Không thể tải dữ liệu in. Vui lòng thử lại.
          </div>
        ) : data ? (
          <>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "kitchen" | "receipt")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="kitchen">
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  Phiếu bếp
                </TabsTrigger>
                <TabsTrigger value="receipt">
                  <Receipt className="mr-2 h-4 w-4" />
                  Hóa đơn
                </TabsTrigger>
              </TabsList>

              {/* Kitchen Ticket */}
              <TabsContent value="kitchen" className="mt-4">
                <div className="rounded-lg border bg-white p-6">
                  <div
                    ref={kitchenTicketRef}
                    className="print-container font-mono text-sm"
                  >
                    {/* Header */}
                    <div className="mb-4 text-center">
                      <h1 className="mb-1 text-xl font-bold">PHIẾU BẾP</h1>
                      <p className="text-xs">NOVA Hotel</p>
                    </div>

                    <div className="separator" />

                    {/* Order Info */}
                    <div className="mb-4 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Số đơn:</span>
                        <span className="font-bold">{data.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thời gian:</span>
                        <span>
                          {format(
                            new Date(data.createdAt),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </span>
                      </div>
                      {data.tableNumber && (
                        <div className="flex justify-between">
                          <span>Bàn số:</span>
                          <span className="font-bold">{data.tableNumber}</span>
                        </div>
                      )}
                      {data.roomName && (
                        <div className="flex justify-between">
                          <span>Phòng:</span>
                          <span className="font-bold">{data.roomName}</span>
                        </div>
                      )}
                      {data.bookingCode && (
                        <div className="flex justify-between">
                          <span>Mã booking:</span>
                          <span>{data.bookingCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="separator" />

                    {/* Items */}
                    <div className="mb-4">
                      <h2 className="mb-2 font-bold">DANH SÁCH MÓN</h2>
                      <table>
                        <tbody>
                          {data.items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-1">
                                <div className="font-bold">{item.itemName}</div>
                                {item.notes && (
                                  <div className="text-xs italic">
                                    Ghi chú: {item.notes}
                                  </div>
                                )}
                              </td>
                              <td className="py-1 text-right font-bold">
                                x{item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="separator" />

                    {/* Footer */}
                    <div className="mt-4 text-center text-xs">
                      <p>*** PHIẾU BẾP ***</p>
                      <p className="mt-2">Cảm ơn!</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Customer Receipt */}
              <TabsContent value="receipt" className="mt-4">
                <div className="rounded-lg border bg-white p-6">
                  <div
                    ref={receiptRef}
                    className="print-container font-mono text-sm"
                  >
                    {/* Header */}
                    <div className="mb-4 text-center">
                      <h1 className="mb-1 text-xl font-bold">NOVA HOTEL</h1>
                      <p className="text-xs">HÓA ĐƠN BÁN HÀNG</p>
                      <p className="text-xs">
                        Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
                      </p>
                      <p className="text-xs">Hotline: 0123-456-789</p>
                    </div>

                    <div className="separator" />

                    {/* Order Info */}
                    <div className="mb-4 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Số hóa đơn:</span>
                        <span className="font-bold">{data.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngày:</span>
                        <span>
                          {format(
                            new Date(data.createdAt),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </span>
                      </div>
                      {data.customerName && (
                        <div className="flex justify-between">
                          <span>Khách hàng:</span>
                          <span>{data.customerName}</span>
                        </div>
                      )}
                      {data.tableNumber && (
                        <div className="flex justify-between">
                          <span>Bàn số:</span>
                          <span>{data.tableNumber}</span>
                        </div>
                      )}
                      {data.roomName && (
                        <div className="flex justify-between">
                          <span>Phòng:</span>
                          <span>{data.roomName}</span>
                        </div>
                      )}
                    </div>

                    <div className="separator" />

                    {/* Items */}
                    <div className="mb-4">
                      <table>
                        <thead>
                          <tr className="border-b text-xs">
                            <th className="py-1 text-left">Tên món</th>
                            <th className="py-1 text-center">SL</th>
                            <th className="py-1 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.items.map((item, index) => {
                            // Calculate item total (quantity is already in the schema)
                            const itemTotal = item.quantity;
                            return (
                              <tr key={index} className="border-b text-xs">
                                <td className="py-1">{item.itemName}</td>
                                <td className="py-1 text-center">
                                  {item.quantity}
                                </td>
                                <td className="py-1 text-right">-</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="separator" />

                    {/* Total */}
                    <div className="mb-4 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>TỔNG CỘNG:</span>
                        <span>
                          {formatMoney(data.totalAmount).vndFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="separator" />

                    {/* Footer */}
                    <div className="mt-4 text-center text-xs">
                      <p>Cảm ơn quý khách!</p>
                      <p className="mt-1">Hẹn gặp lại!</p>
                      <p className="mt-2">*** HÓA ĐƠN ***</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                In {activeTab === "kitchen" ? "phiếu bếp" : "hóa đơn"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
