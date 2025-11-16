import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Receipt,
} from "lucide-react";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMoney } from "~/lib/utils";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
} from "~/services/api/invoices/invoice.types";
import { useCheckoutStore } from "~/store/checkout.store";
import {
  useBookingPendingCharges,
  useCheckout,
  useCreateCheckoutInvoice,
  useInvoicePreview,
  useInvoicesByBooking,
} from "../container/use-booking-checkout.hooks";
import { useCheckoutEligibility } from "../container/use-booking-financial-status.hooks";
import InvoiceDetailSheet from "./invoice-detail-sheet";

import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingCode: string;
  bookingDetail?: BookingDetailResponseDto; // NEW: Pass booking detail for validation
}

export default function CheckoutSheet({
  open,
  onOpenChange,
  bookingId,
  bookingCode,
  bookingDetail,
}: CheckoutSheetProps) {
  const {
    selectedInvoiceId,
    setSelectedInvoiceId,
    createdInvoiceId,
    setCreatedInvoiceId,
    showInvoiceDetail,
    setShowInvoiceDetail,
    applyVat,
    setApplyVat,
    applyServiceCharge,
    setApplyServiceCharge,
    reset,
  } = useCheckoutStore();

  const { data: pendingCharges, isPending: isLoadingCharges } =
    useBookingPendingCharges(bookingId, open);

  const { data: existingInvoices, isPending: isLoadingInvoices } =
    useInvoicesByBooking(bookingId, open);

  const { mutate: createInvoice, isPending: isCreatingInvoice } =
    useCreateCheckoutInvoice(bookingId);

  const { mutate: finalizeCheckout, isPending: isCheckingOut } =
    useCheckout(bookingId);

  // NEW: Use enhanced checkout eligibility validation
  const checkoutEligibility = useCheckoutEligibility(bookingDetail, {
    pendingOrders: pendingCharges?.pendingOrders,
  });
  const {
    canProceed: canCheckout,
    blockingReasons,
    warnings,
  } = checkoutEligibility;

  // Detect if this is post-checkout mode
  const isPostCheckout = bookingDetail?.status === "CheckedOut";

  const previewData = useMemo(() => {
    if (!pendingCharges?.pendingOrders) {
      return {
        posOrderIds: [],
        serviceOrderIds: [],
        applyVat,
        applyServiceCharge,
      };
    }

    const posOrderIds =
      pendingCharges.pendingOrders.posOrders?.map((order) => order.id) || [];
    const serviceOrderIds =
      pendingCharges.pendingOrders.serviceOrders?.map((order) => order.id) ||
      [];

    return {
      posOrderIds,
      serviceOrderIds,
      applyVat,
      applyServiceCharge,
    };
  }, [pendingCharges, applyVat, applyServiceCharge]);

  // Use invoice preview hook
  const { data: invoicePreview } = useInvoicePreview(previewData, open);

  const activeInvoiceId = selectedInvoiceId || createdInvoiceId;

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

  // Handler to finalize checkout
  const handleFinalCheckout = () => {
    finalizeCheckout(
      {
        actualCheckoutTime: new Date().toISOString(),
        notes: undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const shouldShowCreateInvoice = useMemo(() => {
    if (!existingInvoices || existingInvoices.length === 0) {
      return true;
    }
    const hasUnpaidInvoice = existingInvoices?.some(
      (invoice) => invoice.status !== "Paid"
    );
    return hasUnpaidInvoice;
  }, [, existingInvoices]);

  const handleBackFromDetail = () => {
    setShowInvoiceDetail(false);
    setSelectedInvoiceId(null);
    setCreatedInvoiceId(null);
  };

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
          className="w-full sm:max-w-[90vw] lg:max-w-6xl p-0"
        >
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-xl">
              {isPostCheckout
                ? `Thu tiền sau checkout - #{bookingCode}`
                : `Checkout đơn đặt phòng #{bookingCode}`}
            </SheetTitle>
            <SheetDescription>
              {isPostCheckout
                ? "Booking đã checkout. Vui lòng thanh toán các hóa đơn còn nợ."
                : "Xem tổng quan chi phí và hoàn tất checkout"}
            </SheetDescription>
          </SheetHeader>

          {isLoadingCharges ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingCharges ? (
            <>
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">
                      Preview Invoice - Hóa đơn tạm tính
                    </h1>
                    <Badge variant="outline">Chưa tạo</Badge>
                  </div>
                  <div className="p-6">
                    {invoicePreview ? (
                      <div className="space-y-4">
                        {/* Fee Toggles */}
                        <div className="flex items-center gap-6 p-4  rounded-lg">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="preview-vat"
                              checked={applyVat}
                              onCheckedChange={setApplyVat}
                            />
                            <Label
                              htmlFor="preview-vat"
                              className="cursor-pointer"
                            >
                              Áp dụng VAT
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="preview-service"
                              checked={applyServiceCharge}
                              onCheckedChange={setApplyServiceCharge}
                            />
                            <Label
                              htmlFor="preview-service"
                              className="cursor-pointer"
                            >
                              Áp dụng Service Charge
                            </Label>
                          </div>
                        </div>

                        {/* POS Items Table */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                            Đồ ăn & Đồ uống (POS)
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tên món</TableHead>
                                <TableHead className="text-right">SL</TableHead>
                                <TableHead className="text-right">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="text-right">
                                  Thành tiền
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoicePreview.posOrderItems &&
                              invoicePreview.posOrderItems.length > 0 ? (
                                invoicePreview.posOrderItems.map(
                                  (item, index) => (
                                    <TableRow key={index}>
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
                                          formatMoney(item.amount || 0)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground py-4"
                                  >
                                    Không có món ăn/đồ uống
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Service Items Table */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                            Dịch vụ
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tên dịch vụ</TableHead>
                                <TableHead className="text-right">SL</TableHead>
                                <TableHead className="text-right">
                                  Đơn giá
                                </TableHead>
                                <TableHead className="text-right">
                                  Thành tiền
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoicePreview.serviceOrderItems &&
                              invoicePreview.serviceOrderItems.length > 0 ? (
                                invoicePreview.serviceOrderItems.map(
                                  (item, index) => (
                                    <TableRow key={index}>
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
                                          formatMoney(item.amount || 0)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground py-4"
                                  >
                                    Không có dịch vụ
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        <Separator />

                        {/* Summary Section */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Subtotal:
                            </span>
                            <span className="font-mono">
                              {
                                formatMoney(invoicePreview.subTotal || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          {invoicePreview.vatAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                VAT:
                              </span>
                              <span className="font-mono">
                                {
                                  formatMoney(invoicePreview.vatAmount)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                          )}
                          {invoicePreview.serviceChargeAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Service Charge:
                              </span>
                              <span className="font-mono">
                                {
                                  formatMoney(
                                    invoicePreview.serviceChargeAmount
                                  ).vndFormatted
                                }
                              </span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold text-base">
                            <span>Tổng cộng:</span>
                            <span className="font-mono text-primary">
                              {
                                formatMoney(invoicePreview.totalAmount || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Receipt />
                          </EmptyMedia>
                          <EmptyTitle>Không có charges nào</EmptyTitle>
                          <EmptyDescription>
                            Booking này không có POS orders hoặc Service orders
                            chưa thanh toán
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <Card className="shadow-sm gap-2 p-4">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg">Thông tin phòng</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      {pendingCharges.roomInvoice ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Tổng tiền phòng:
                            </span>
                            <span className="font-mono font-semibold">
                              {
                                formatMoney(
                                  pendingCharges.roomInvoice.total || 0
                                ).vndFormatted
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Đã thanh toán:
                            </span>
                            <span className="font-mono">
                              {
                                formatMoney(
                                  pendingCharges.roomInvoice.paid || 0
                                ).vndFormatted
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
                  <Separator className="my-6" />
                  <div className="grid gap-2">
                    <h1>
                      Lịch sử hóa đơn{" "}
                      {existingInvoices && existingInvoices.length > 0
                        ? `(${existingInvoices.length})`
                        : ""}
                    </h1>
                    <div className="">
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
                                  <Badge
                                    variant={
                                      INVOICE_TYPES.find(
                                        (item) =>
                                          item.value === invoice.invoiceType
                                      )?.variant
                                    }
                                  >
                                    {
                                      INVOICE_TYPES.find(
                                        (item) =>
                                          item.value === invoice.invoiceType
                                      )?.label
                                    }
                                  </Badge>
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
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <Receipt />
                            </EmptyMedia>
                            <EmptyTitle>Chưa có hóa đơn nào</EmptyTitle>
                            <EmptyDescription>
                              Tạo invoice mới để bắt đầu thanh toán
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Info />
                </EmptyMedia>
                <EmptyTitle>Không tìm thấy thông tin</EmptyTitle>
                <EmptyDescription>
                  Không tìm thấy thông tin checkout cho booking này
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <SheetFooter className="p-6 pt-4 border-t">
            <div className="w-full space-y-3">
              {/* Blocking Reasons Alert */}
              {!canCheckout && blockingReasons.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Không thể checkout</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {blockingReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings Alert */}
              {warnings.length > 0 && (
                <Alert
                  variant="default"
                  className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-600">Cảnh báo</AlertTitle>
                  <AlertDescription className="text-yellow-600">
                    <ul className="list-disc list-inside space-y-1">
                      {warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Post-checkout info */}
              {isPostCheckout && (
                <Alert
                  variant="default"
                  className="border-blue-500 bg-blue-50 dark:bg-blue-950"
                >
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-600">
                    Booking đã checkout. Chỉ có thể thanh toán các hóa đơn còn
                    nợ.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-3">
                {shouldShowCreateInvoice && !isPostCheckout && (
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={isCreatingInvoice}
                    variant={"success-outline"}
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
                )}
                {/* Only show checkout button if not in post-checkout mode */}
                {!isPostCheckout && canCheckout && (
                  <Button
                    onClick={handleFinalCheckout}
                    disabled={isCheckingOut}
                    variant="success"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang checkout...
                      </>
                    ) : (
                      "Hoàn tất Checkout"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </SheetFooter>
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
          isNewlyCreatedInvoice={!!createdInvoiceId} // Invoice vừa tạo → Checkout type
        />
      )}
    </>
  );
}
