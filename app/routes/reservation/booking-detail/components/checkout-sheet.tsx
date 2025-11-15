import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Info, Loader2, Receipt } from "lucide-react";
import { useMemo } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMoney } from "~/lib/utils";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import { useCheckoutStore } from "~/store/checkout.store";
import {
  useBookingPendingCharges,
  useCreateCheckoutInvoice,
  useInvoicesByBooking,
} from "../container/use-booking-checkout.hooks";
import InvoiceDetailSheet from "./invoice-detail-sheet";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingCode: string;
}

export default function CheckoutSheet({
  open,
  onOpenChange,
  bookingId,
  bookingCode,
}: CheckoutSheetProps) {
  const {
    selectedInvoiceId,
    setSelectedInvoiceId,
    createdInvoiceId,
    setCreatedInvoiceId,
    showInvoiceDetail,
    setShowInvoiceDetail,
    reset,
  } = useCheckoutStore();

  // Fetch pending charges
  const { data: pendingCharges, isPending: isLoadingCharges } =
    useBookingPendingCharges(bookingId, open);

  // Fetch existing invoices for this booking
  const { data: existingInvoices, isPending: isLoadingInvoices } =
    useInvoicesByBooking(bookingId, open);

  // Create invoice mutation
  const { mutate: createInvoice, isPending: isCreatingInvoice } =
    useCreateCheckoutInvoice(bookingId);

  // Determine if we should show preview section
  // Q3.1: Show preview khi KHÔNG có invoice unpaid + có room balance
  const hasUnpaidInvoice = useMemo(() => {
    return existingInvoices?.some((inv) => inv.status === "Unpaid");
  }, [existingInvoices]);

  const hasRoomBalance = useMemo(() => {
    return (pendingCharges?.roomInvoice?.balance || 0) > 0;
  }, [pendingCharges]);

  const shouldShowPreview = !hasUnpaidInvoice && hasRoomBalance;

  // Check if has pending orders (POS or Service)
  const hasPendingOrders = useMemo(() => {
    const posCount = pendingCharges?.pendingOrders?.posOrders?.length || 0;
    const serviceCount =
      pendingCharges?.pendingOrders?.serviceOrders?.length || 0;
    return posCount > 0 || serviceCount > 0;
  }, [pendingCharges]);

  // Get active invoice ID (selected or created)
  const activeInvoiceId = selectedInvoiceId || createdInvoiceId;

  // Handler to create invoice
  const handleCreateInvoice = () => {
    createInvoice(undefined, {
      onSuccess: (data) => {
        if (data?.invoiceId) {
          setCreatedInvoiceId(data.invoiceId);
          setShowInvoiceDetail(true);
        }
      },
    });
  };

  // Handler to select existing invoice
  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowInvoiceDetail(true);
  };

  // Handler to go back from invoice detail
  const handleBackFromDetail = () => {
    setShowInvoiceDetail(false);
    setSelectedInvoiceId(null);
    setCreatedInvoiceId(null);
  };

  // Handler when sheet closes
  const handleSheetClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset(); // Reset all checkout state
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      {/* Main Checkout Sheet */}
      <Sheet open={open} onOpenChange={handleSheetClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[90vw] lg:max-w-6xl p-0 flex flex-col"
        >
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-xl">
              Checkout đơn đặt phòng #{bookingCode}
            </SheetTitle>
            <SheetDescription>
              Xem tổng quan chi phí và hoàn tất checkout
            </SheetDescription>
          </SheetHeader>

          {isLoadingCharges ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingCharges ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Preview Section - Q1 & Q2 */}
                {shouldShowPreview && (
                  <Card className="shadow-sm">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">
                            Preview Invoice - Hóa đơn tạm tính
                          </CardTitle>
                        </div>
                        <Badge variant="outline">Chưa tạo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {hasPendingOrders ? (
                        <div className="space-y-4">
                          {/* POS Items */}
                          {pendingCharges.pendingOrders?.posOrders &&
                            pendingCharges.pendingOrders.posOrders.length >
                              0 && (
                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                                  Đồ ăn & Đồ uống (POS)
                                </h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Tên món</TableHead>
                                      <TableHead className="text-right">
                                        SL
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Đơn giá
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Thành tiền
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {pendingCharges.pendingOrders.posOrders.flatMap(
                                      (order) =>
                                        order.items.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                              {item.itemName}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                              {
                                                formatMoney(item.unitPrice || 0)
                                                  .vndFormatted
                                              }
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                              {
                                                formatMoney(item.subtotal || 0)
                                                  .vndFormatted
                                              }
                                            </TableCell>
                                          </TableRow>
                                        ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                          {/* Service Items */}
                          {pendingCharges.pendingOrders?.serviceOrders &&
                            pendingCharges.pendingOrders.serviceOrders.length >
                              0 && (
                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                                  Dịch vụ
                                </h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Tên dịch vụ</TableHead>
                                      <TableHead className="text-right">
                                        SL
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Đơn giá
                                      </TableHead>
                                      <TableHead className="text-right">
                                        Thành tiền
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {pendingCharges.pendingOrders.serviceOrders.map(
                                      (order) => (
                                        <TableRow key={order.id}>
                                          <TableCell className="font-medium">
                                            {order.serviceName}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {order.quantity}
                                          </TableCell>
                                          <TableCell className="text-right font-mono text-sm">
                                            {
                                              formatMoney(order.unitPrice || 0)
                                                .vndFormatted
                                            }
                                          </TableCell>
                                          <TableCell className="text-right font-mono text-sm">
                                            {
                                              formatMoney(order.subtotal || 0)
                                                .vndFormatted
                                            }
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                          <Separator />
                        </div>
                      ) : (
                        // Q2.1: Không có POS/Service orders → Empty + nút tạo invoice
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Receipt className="w-12 h-12 text-muted-foreground mb-3" />
                            <p className="font-medium">Không có charges nào</p>
                            <p className="text-sm text-muted-foreground">
                              Booking này không có POS orders hoặc Service
                              orders chưa thanh toán
                            </p>
                          </div>
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              Vẫn có thể tạo invoice để thanh toán tiền phòng
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Room Balance Info - Q3.1: đặt cùng với lịch sử hóa đơn */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-lg">Thông tin phòng</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {pendingCharges.roomInvoice ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tổng tiền phòng:
                          </span>
                          <span className="font-mono font-semibold">
                            {
                              formatMoney(pendingCharges.roomInvoice.total || 0)
                                .vndFormatted
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Đã thanh toán:
                          </span>
                          <span className="font-mono">
                            {
                              formatMoney(pendingCharges.roomInvoice.paid || 0)
                                .vndFormatted
                            }
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-semibold">
                          <span>Còn lại:</span>
                          <span className="font-mono text-destructive text-lg">
                            {
                              formatMoney(
                                pendingCharges.roomInvoice.balance || 0
                              ).vndFormatted
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Không có thông tin phòng
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Existing Invoices List - Q3: luôn hiển thị */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-lg">
                      Lịch sử hóa đơn{" "}
                      {existingInvoices && existingInvoices.length > 0
                        ? `(${existingInvoices.length})`
                        : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoadingInvoices ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : existingInvoices && existingInvoices.length > 0 ? (
                      <div className="grid gap-3">
                        {existingInvoices.map((invoice) => (
                          <Card
                            key={invoice.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-card border"
                            onClick={() => handleSelectInvoice(invoice.id!)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm hover:text-primary">
                                  {invoice.invoiceNo}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {invoice.issuedAt
                                    ? format(
                                        parseISO(invoice.issuedAt),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: vi }
                                      )
                                    : "N/A"}
                                </p>
                                <p className="text-sm font-mono">
                                  {formatMoney(invoice.total || 0).vndFormatted}
                                </p>
                              </div>
                              <div className="text-right space-y-2">
                                <Badge
                                  variant={
                                    INVOICE_STATUSES.find(
                                      (item) => item.value === invoice.status
                                    )?.variant
                                  }
                                >
                                  {
                                    INVOICE_STATUSES.find(
                                      (item) => item.value === invoice.status
                                    )?.label
                                  }
                                </Badge>
                                {(invoice.balance || 0) > 0 && (
                                  <p className="text-xs text-destructive font-mono">
                                    Còn:{" "}
                                    {
                                      formatMoney(invoice.balance || 0)
                                        .vndFormatted
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Receipt className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="font-medium">Chưa có hóa đơn nào</p>
                        <p className="text-sm text-muted-foreground">
                          Tạo invoice mới để bắt đầu thanh toán
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Create Invoice Button - Đặt ở cuối trang */}
                {(shouldShowPreview ||
                  !existingInvoices ||
                  existingInvoices.length === 0) && (
                  <div className="flex justify-center pb-4">
                    <Button
                      onClick={handleCreateInvoice}
                      disabled={isCreatingInvoice}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isCreatingInvoice ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo invoice...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4 mr-2" />
                          Tạo Invoice
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="font-medium">Không tìm thấy thông tin</p>
                <p className="text-sm text-muted-foreground">
                  Không tìm thấy thông tin checkout cho booking này
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Invoice Detail Sheet - Q3.3: mở song song */}
      {activeInvoiceId && (
        <InvoiceDetailSheet
          open={showInvoiceDetail}
          onOpenChange={setShowInvoiceDetail}
          bookingId={bookingId}
          invoiceId={activeInvoiceId}
          onBack={handleBackFromDetail}
        />
      )}
    </>
  );
}
