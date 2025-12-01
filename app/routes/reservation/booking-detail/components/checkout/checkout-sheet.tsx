import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Receipt,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import { cn, formatMoney } from "~/lib/utils";
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
} from "../../container/use-booking-checkout.hooks";
import { useCheckoutEligibility } from "../../container/use-booking-financial-status.hooks";
import InvoiceDetailSheet from "./invoice-detail-sheet";

import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingCode: string;
  bookingDetail?: BookingDetailResponseDto;
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

  const checkoutEligibility = useCheckoutEligibility(bookingDetail, {
    pendingOrders: pendingCharges?.pendingOrders,
  });
  const {
    canProceed: canCheckout,
    blockingReasons,
    warnings,
  } = checkoutEligibility;

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
    return { posOrderIds, serviceOrderIds, applyVat, applyServiceCharge };
  }, [pendingCharges, applyVat, applyServiceCharge]);

  const { data: invoicePreview } = useInvoicePreview(previewData, open);

  const activeInvoiceId = selectedInvoiceId || createdInvoiceId;

  const shouldShowCreateInvoice = useMemo(() => {
    const hasCheckoutInvoice = existingInvoices?.some(
      (inv) => inv.invoiceType === "Checkout" && inv.status !== "Voided"
    );

    if (hasCheckoutInvoice) return false;

    const hasPendingOrders =
      (pendingCharges?.pendingOrders?.posOrders?.length || 0) > 0 ||
      (pendingCharges?.pendingOrders?.serviceOrders?.length || 0) > 0;

    return hasPendingOrders;
  }, [existingInvoices, pendingCharges]);
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

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowInvoiceDetail(true);
  };

  const handleFinalCheckout = () => {
    finalizeCheckout(
      { actualCheckoutTime: new Date().toISOString() },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleSheetClose = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const handleBackFromDetail = () => {
    setShowInvoiceDetail(false);
    setSelectedInvoiceId(null);
    setCreatedInvoiceId(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[100vw] lg:max-w-6xl gap-0 p-0 flex flex-col bg-slate-50"
        >
          {/* HEADER */}
          <SheetHeader className="px-6 py-4 border-b bg-background shrink-0">
            <div className="space-y-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                {isPostCheckout ? (
                  <span>Xem hóa đơn</span>
                ) : (
                  <p>Checkout Booking #{bookingCode}</p>
                )}
              </SheetTitle>
              <SheetDescription>
                Kiểm tra các khoản phí phát sinh, thanh toán hóa đơn và hoàn tất
                thủ tục trả phòng.
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            {isLoadingCharges ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">
                  Đang tổng hợp dữ liệu thanh toán...
                </p>
              </div>
            ) : pendingCharges ? (
              <div className="h-full flex flex-col lg:flex-row">
                {/* LEFT COL: INVOICE PREVIEW (DRAFT BILL) */}
                <ScrollArea className="flex-1 border-r bg-background">
                  <div className="p-6 space-y-6">
                    {/* Section: Room Info Quick View (ReadOnly) */}
                    {pendingCharges.roomInvoice &&
                      (pendingCharges.roomInvoice.balance || 0) > 0 && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <Wallet className="h-4 w-4 text-orange-600" />
                          <AlertTitle className="text-orange-800">
                            Tiền phòng chưa thanh toán
                          </AlertTitle>
                          <AlertDescription className="flex justify-between items-center mt-2">
                            <span className="text-orange-800/80">
                              Hóa đơn phòng:
                            </span>
                            <span className="font-bold font-mono text-lg text-orange-700">
                              {
                                formatMoney(
                                  pendingCharges.roomInvoice.balance || 0
                                ).vndFormatted
                              }
                            </span>
                          </AlertDescription>
                        </Alert>
                      )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold flex items-center gap-2">
                            Phí phát sinh & Dịch vụ
                            <Badge
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              Chưa lên hóa đơn
                            </Badge>
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Các khoản này sẽ được gộp vào Invoice Checkout
                          </p>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-4 bg-muted/40 p-2 rounded-lg border">
                          <div className="flex items-center gap-2 px-2">
                            <Switch
                              id="vat"
                              checked={applyVat}
                              onCheckedChange={setApplyVat}
                            />
                            <Label
                              htmlFor="vat"
                              className="cursor-pointer text-xs font-medium"
                            >
                              VAT
                            </Label>
                          </div>
                          <Separator orientation="vertical" className="h-6" />
                          <div className="flex items-center gap-2 px-2">
                            <Switch
                              id="svc"
                              checked={applyServiceCharge}
                              onCheckedChange={setApplyServiceCharge}
                            />
                            <Label
                              htmlFor="svc"
                              className="cursor-pointer text-xs font-medium"
                            >
                              Service Charge
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Bill Metaphor Container */}
                      <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                        {invoicePreview &&
                        (invoicePreview.posOrderItems?.length > 0 ||
                          invoicePreview.serviceOrderItems?.length > 0) ? (
                          <>
                            <Table>
                              <TableHeader className="bg-muted/30">
                                <TableRow>
                                  <TableHead className="w-[50%] text-xs font-semibold uppercase text-muted-foreground">
                                    Hạng mục
                                  </TableHead>
                                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                                    SL
                                  </TableHead>
                                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                                    Đơn giá
                                  </TableHead>
                                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                                    Thành tiền
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {/* POS Items */}
                                {invoicePreview.posOrderItems?.map(
                                  (item, idx) => (
                                    <TableRow
                                      key={`pos-${idx}`}
                                      className="group hover:bg-muted/10"
                                    >
                                      <TableCell className="font-medium group-hover:text-primary transition-colors py-3">
                                        {item.itemName}
                                        <span className="block text-xs text-muted-foreground font-normal">
                                          Minibar / Restaurant
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-xs py-3">
                                        {
                                          formatMoney(item.unitPrice)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                      <TableCell className="text-right font-mono font-medium py-3">
                                        {formatMoney(item.amount).vndFormatted}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}

                                {/* Service Items */}
                                {invoicePreview.serviceOrderItems?.map(
                                  (item, idx) => (
                                    <TableRow
                                      key={`svc-${idx}`}
                                      className="group hover:bg-muted/10"
                                    >
                                      <TableCell className="font-medium group-hover:text-primary transition-colors py-3">
                                        {item.itemName}
                                        <span className="block text-xs text-muted-foreground font-normal">
                                          Spa / Laundry / Other
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right py-3">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell className="text-right font-mono text-xs py-3">
                                        {
                                          formatMoney(item.unitPrice)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                      <TableCell className="text-right font-mono font-medium py-3">
                                        {formatMoney(item.amount).vndFormatted}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>

                            {/* Bill Footer Summary */}
                            <div className="bg-muted/10 p-4 border-t space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Tạm tính:
                                </span>
                                <span className="font-mono">
                                  {
                                    formatMoney(invoicePreview.subTotal)
                                      .vndFormatted
                                  }
                                </span>
                              </div>
                              {(invoicePreview.vatAmount > 0 ||
                                invoicePreview.serviceChargeAmount > 0) && (
                                <div className="text-xs text-muted-foreground space-y-1 py-1">
                                  {invoicePreview.vatAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span>VAT:</span>
                                      <span>
                                        {
                                          formatMoney(invoicePreview.vatAmount)
                                            .vndFormatted
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {invoicePreview.serviceChargeAmount > 0 && (
                                    <div className="flex justify-between">
                                      <span>Service Charge:</span>
                                      <span>
                                        {
                                          formatMoney(
                                            invoicePreview.serviceChargeAmount
                                          ).vndFormatted
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <Separator className="bg-slate-300" />
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-semibold text-foreground">
                                  Tổng phát sinh:
                                </span>
                                <span className="font-bold text-xl text-primary font-mono">
                                  {
                                    formatMoney(invoicePreview.totalAmount)
                                      .vndFormatted
                                  }
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 flex flex-col items-center text-center p-4">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                              <Receipt className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-base font-semibold text-muted-foreground">
                              Không có phí phát sinh
                            </h3>
                            <p className="text-sm text-muted-foreground/60 max-w-xs mt-1">
                              Booking này không có các khoản charge từ POS hoặc
                              Dịch vụ chưa thanh toán.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* RIGHT COL: INVOICE LIST & PAYMENT */}
                <div className="w-full lg:w-[420px] bg-slate-50 border-l flex flex-col h-full shadow-inner">
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Hóa đơn cần thanh toán
                      </h3>
                      {existingInvoices && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {existingInvoices.length}
                        </Badge>
                      )}
                    </div>

                    {isLoadingInvoices ? (
                      <div className="flex flex-col gap-3">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-24 bg-muted/20 animate-pulse rounded-lg"
                          />
                        ))}
                      </div>
                    ) : existingInvoices && existingInvoices.length > 0 ? (
                      <div className="space-y-3">
                        {existingInvoices.map((invoice) => {
                          const isPaid = invoice.status === "Paid";
                          if (invoice.status == "Voided") {
                            return null;
                          }
                          return (
                            <Card
                              key={invoice.id}
                              className={cn(
                                "cursor-pointer transition-all duration-200 group relative overflow-hidden p-0 ",
                                isPaid
                                  ? "bg-white shadow-sm hover:border-green-500 border-transparent "
                                  : "bg-white shadow-sm hover:shadow-md "
                              )}
                              onClick={() => handleSelectInvoice(invoice.id!)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div className="space-y-0.5">
                                    <p
                                      className={cn(
                                        "font-semibold text-sm",
                                        !isPaid &&
                                          "text-foreground group-hover:text-primary"
                                      )}
                                    >
                                      {invoice.invoiceNo}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {invoice.issuedAt
                                        ? format(
                                            parseISO(invoice.issuedAt),
                                            "dd/MM HH:mm",
                                            { locale: vi }
                                          )
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <Badge
                                    variant={isPaid ? "success" : "warning"}
                                    className="text-[10px] px-2"
                                  >
                                    {
                                      INVOICE_STATUSES.find(
                                        (i) => i.value === invoice.status
                                      )?.label
                                    }
                                  </Badge>
                                </div>

                                {!isPaid && (
                                  <div className="flex justify-between items-end mt-3 pt-2 border-t border-dashed">
                                    <span className="text-xs text-muted-foreground">
                                      Còn nợ:
                                    </span>
                                    <span className="font-bold text-destructive font-mono text-base">
                                      {
                                        formatMoney(invoice.balance || 0)
                                          .vndFormatted
                                      }
                                    </span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4 text-sm text-muted-foreground bg-white/50 rounded-lg border border-dashed">
                        Chưa có hóa đơn nào được tạo.
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white border-t space-y-3 shadow-md z-10">
                    {shouldShowCreateInvoice && !isPostCheckout ? (
                      <Button
                        className="w-full h-12 text-base shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                        onClick={handleCreateInvoice}
                        disabled={isCreatingInvoice}
                        variant="success"
                      >
                        {isCreatingInvoice ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Receipt className="mr-2 h-5 w-5" />
                        )}
                        Tạo Invoice thanh toán
                      </Button>
                    ) : (
                      <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md text-center border border-green-100 flex items-center justify-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Sẵn sàng hoàn tất
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter className="p-4 border-t bg-background shrink-0 flex-col sm:flex-row gap-4 sm:items-center sm:justify-between z-20 shadow-sm">
            <div className="flex-1">
              {!canCheckout && blockingReasons.length > 0 ? (
                <div className="flex items-center gap-3 text-destructive text-sm font-medium bg-destructive/5 border border-destructive/10 px-4 py-3 rounded-md">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    {blockingReasons[0]}{" "}
                    {blockingReasons.length > 1 &&
                      `(+${blockingReasons.length - 1} vấn đề khác)`}
                  </span>
                </div>
              ) : warnings.length > 0 ? (
                <div className="flex items-center gap-3 text-orange-600 text-sm font-medium bg-orange-50 border border-orange-100 px-4 py-3 rounded-md">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{warnings[0]}</span>
                </div>
              ) : (
                <div className=" items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
                  <Info className="w-4 h-4" />
                  <span>
                    Kiểm tra kỹ thông tin và nhận chìa khóa trước khi hoàn tất.
                  </span>
                </div>
              )}
            </div>

            {/* Final Action */}
            {!isPostCheckout && (
              <Button
                onClick={handleFinalCheckout}
                disabled={!canCheckout || isCheckingOut}
                variant={!canCheckout ? "secondary" : "success"}
                className={cn(
                  "w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold",
                  canCheckout
                    ? "shadow-lg shadow-green-200 hover:shadow-green-300"
                    : "opacity-50"
                )}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  <>
                    Hoàn tất Checkout <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* INVOICE DETAIL SHEET */}
      {activeInvoiceId && (
        <InvoiceDetailSheet
          open={showInvoiceDetail}
          onOpenChange={setShowInvoiceDetail}
          bookingId={bookingId}
          invoiceId={activeInvoiceId}
          onBack={handleBackFromDetail}
          isNewlyCreatedInvoice={!!createdInvoiceId}
        />
      )}
    </>
  );
}
