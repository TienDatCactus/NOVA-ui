import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  Hash,
  Info,
  Loader2,
  RefreshCw,
  Tag,
  Upload,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import CurrencyView from "~/components/currency-view";
import { PaymentMethodSelector } from "~/components/payment-method-selector";
import { buildPaymentCallbackUrls } from "~/lib/payment-url-builder";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
} from "~/services/api/invoices/invoice.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useCheckoutStore } from "~/store/checkout.store";
import {
  useCalculateInvoiceFees,
  useCheckoutPayment,
  useInvoiceDetail,
  useInvoicePayment,
  useSyncInvoiceWithOrders,
  useUpdateInvoice,
} from "../../container/use-booking-checkout.hooks";
import {
  canInvoiceAcceptPayment,
  validatePaymentAmount,
} from "../../container/use-booking-state.hooks";
import { InvoicesService } from "~/services/api/invoices";
import { AxiosError } from "axios";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

const { StaffCheckoutPaymentRequestSchema } = BookingSchema;

type CheckoutPaymentFormData = z.infer<
  typeof BookingSchema.StaffCheckoutPaymentRequestSchema
>;

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingCode: string;
  bookingSource: BookingDetailResponseDto["source"];
  invoiceId: string;
  onBack: () => void;
  isNewlyCreatedInvoice?: boolean;
}

export default function InvoiceDetailSheet({
  open,
  onOpenChange,
  bookingId,
  bookingCode,
  bookingSource,
  invoiceId,
  onBack,
  isNewlyCreatedInvoice = false,
}: InvoiceDetailSheetProps) {
  // --- HOOKS & STATE ---
  const { applyVat, applyServiceCharge, setApplyVat, setApplyServiceCharge } =
    useCheckoutStore();

  const { data: invoiceDetail, isPending: isLoadingInvoice } = useInvoiceDetail(
    invoiceId,
    !!invoiceId && open
  );

  // --- MUTATIONS ---
  const isCheckoutInvoice =
    isNewlyCreatedInvoice || invoiceDetail?.invoiceType === "Checkout";

  const { mutate: updateInvoice, isPending: isUpdatingInvoice } =
    useUpdateInvoice(invoiceId);
  const { mutate: checkoutPayment, isPending: isProcessingCheckoutPayment } =
    useCheckoutPayment(bookingId);
  const { mutate: invoicePayment, isPending: isProcessingInvoicePayment } =
    useInvoicePayment(invoiceId, bookingId);
  const { mutate: syncInvoice, isPending: isSyncingInvoice } =
    useSyncInvoiceWithOrders(invoiceId, bookingId);

  const isProcessing =
    isUpdatingInvoice ||
    isProcessingCheckoutPayment ||
    isProcessingInvoicePayment ||
    isSyncingInvoice;

  // --- FORM SETUP ---
  const paymentForm = useForm<CheckoutPaymentFormData>({
    resolver: zodResolver(StaffCheckoutPaymentRequestSchema),
    defaultValues: {
      method: "Cash",
      amount: 0,
      transactionReference: "",
    },
  });

  const amount = paymentForm.watch("amount");

  useEffect(() => {
    if (invoiceDetail?.balance && invoiceDetail.balance > 0) {
      paymentForm.setValue("amount", invoiceDetail.balance);
    }
  }, [invoiceDetail, paymentForm]);

  const changeAmount = useMemo(() => {
    const balance = invoiceDetail?.balance || 0;
    return amount > balance ? amount - balance : 0;
  }, [amount, invoiceDetail]);

  const paymentEligibility = useMemo(() => {
    if (!invoiceDetail?.status) return { canProceed: false };
    return canInvoiceAcceptPayment(invoiceDetail.status);
  }, [invoiceDetail?.status]);

  const roomItems = useMemo(
    () =>
      invoiceDetail?.items?.filter((item) => item.itemType === "Room") || [],
    [invoiceDetail?.items]
  );

  const serviceItems = useMemo(
    () =>
      invoiceDetail?.items?.filter((item) =>
        ["MenuItem", "ServiceItem"].includes(item.itemType ?? "")
      ) || [],
    [invoiceDetail?.items]
  );

  const roomSubtotal = useMemo(
    () => roomItems.reduce((sum, item) => sum + (item.subtotal || 0), 0),
    [roomItems]
  );

  const serviceSubtotal = useMemo(
    () => serviceItems.reduce((sum, item) => sum + (item.subtotal || 0), 0),
    [serviceItems]
  );

  const hasServiceItems = serviceItems.length > 0;
  const hasOnlyRoomItems = roomItems.length > 0 && !hasServiceItems;
  const { data: calculatedFees, refetch: refetchFees } =
    useCalculateInvoiceFees(
      {
        subtotalAmount: serviceSubtotal || 0,
        applyVat,
        applyServiceCharge,
      },
      !!invoiceDetail &&
        open &&
        invoiceDetail.status !== "Paid" &&
        hasServiceItems
    );

  // --- EFFECTS ---
  useEffect(() => {
    if (invoiceDetail && open) refetchFees();
  }, [applyVat, applyServiceCharge, invoiceDetail, refetchFees]);

  useEffect(() => {
    if (!invoiceDetail || !calculatedFees || !open) return;
    if (!paymentEligibility.canProceed) return;

    const vatChanged =
      (calculatedFees.vatAmount || 0) !== (invoiceDetail.vatAmount || 0);
    const serviceChargeChanged =
      (calculatedFees.serviceChargeAmount || 0) !==
      (invoiceDetail.serviceChargeAmount || 0);

    if (vatChanged || serviceChargeChanged) {
      updateInvoice({
        vatAmount: applyVat ? calculatedFees.vatAmount : 0,
        serviceChargeAmount: applyServiceCharge
          ? calculatedFees.serviceChargeAmount
          : 0,
        paymentMethod: invoiceDetail.paymentMethod || "Cash",
      });
    }
  }, [calculatedFees, invoiceDetail, applyVat, applyServiceCharge, open]);

  const paymentValidation = useMemo(() => {
    if (!invoiceDetail || !invoiceDetail.status) return { isValid: false };
    return validatePaymentAmount(
      amount,
      invoiceDetail.balance || 0,
      invoiceDetail.status
    );
  }, [amount, invoiceDetail, calculatedFees]);

  // --- HANDLERS ---
  const handleSyncInvoice = () => {
    syncInvoice(undefined, {
      onSuccess: (data) => {
        const count =
          (data.posOrdersAdded || 0) + (data.serviceOrdersAdded || 0);
        toast.success(`Đã đồng bộ ${count} order mới.`);
      },
    });
  };

  const handleExportInvoice = async () => {
    try {
      const blob = await InvoicesService.exportInvoiceById(invoiceId);

      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      const filename = `invoice-${invoiceId}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất hóa đơn thành công");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi xuất báo cáo");
      }
    }
  };

  const handlePayment = (data: CheckoutPaymentFormData) => {
    if (!paymentValidation.isValid) {
      paymentForm.setError("amount", {
        message: paymentValidation.error || "Số tiền không hợp lệ",
      });
      return;
    }

    // Build payment callback URLs for gateway redirects
    const { successUrl, cancelUrl } = buildPaymentCallbackUrls({
      type: "invoice",
      id: invoiceId,
      bookingCode,
    });

    if (isCheckoutInvoice) {
      checkoutPayment(
        {
          method: data.method,
          amount: data.amount,
          transactionReference: data.transactionReference || undefined,
          successUrl,
          cancelUrl,
          description: `Thanh toán checkout ${bookingCode}`,
        },
        { onSuccess: () => onBack() }
      );
    } else {
      invoicePayment(
        {
          method: data.method,
          amount: data.amount,
          note: data.transactionReference || "",
          successUrl,
          cancelUrl,
          description: `Thanh toán hóa đơn ${invoiceDetail?.invoiceNo || invoiceId}`,
        },
        { onSuccess: () => onBack() }
      );
    }
  };

  if (!invoiceDetail && !isLoadingInvoice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1100px] p-0 flex flex-col bg-background"
      >
        {/* HEADER */}
        <SheetHeader className="px-8 py-6 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-semibold flex items-center gap-3">
              <span className="font-mono text-muted-foreground">#</span>
              {invoiceDetail?.invoiceNo || "..."}
              <Badge
                variant="outline"
                className={cn(
                  "ml-2 font-normal border-0",
                  INVOICE_STATUSES.find(
                    (s) => s.value === invoiceDetail?.status
                  )?.variant === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-orange-50 text-orange-700"
                )}
              >
                {
                  INVOICE_STATUSES.find(
                    (s) => s.value === invoiceDetail?.status
                  )?.label
                }
              </Badge>
            </SheetTitle>
            <SheetDescription className="text-xs uppercase tracking-wide">
              Chi tiết hóa đơn & Thanh toán
            </SheetDescription>
          </div>

          {/* Actions Header */}
          <div className="flex items-center gap-2">
            {invoiceDetail?.status === "Paid" && (
              <Button variant={"success"} onClick={handleExportInvoice}>
                <Upload />
                Xuất hóa đơn
              </Button>
            )}
            {isCheckoutInvoice &&
              invoiceDetail?.status !== "Paid" &&
              invoiceDetail?.status !== "Voided" && (
                <Button
                  variant="info-outline"
                  size="sm"
                  onClick={handleSyncInvoice}
                  disabled={isSyncingInvoice}
                >
                  <RefreshCw
                    className={cn(
                      "w-3 h-3 mr-2",
                      isSyncingInvoice && "animate-spin"
                    )}
                  />
                  Đồng bộ Order
                </Button>
              )}
          </div>
        </SheetHeader>

        {isLoadingInvoice ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : invoiceDetail ? (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* LEFT: DETAILS (READ ONLY) */}
            <ScrollArea className="flex-1 border-r">
              <div className="p-8 space-y-8">
                {/* Metadata Grid - Clean */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold">
                      <Tag className="w-3 h-3" /> Loại hóa đơn
                    </div>
                    <p className="font-medium pl-5">
                      {
                        INVOICE_TYPES.find(
                          (t) => t.value === invoiceDetail.invoiceType
                        )?.label
                      }
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold">
                      <Calendar className="w-3 h-3" /> Ngày tạo
                    </div>
                    <p className="font-medium pl-5 font-mono">
                      {invoiceDetail.issuedAt
                        ? format(
                            parseISO(invoiceDetail.issuedAt),
                            " HH:mm dd/MM/yyyy",
                            { locale: vi }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold">
                      <CreditCard className="w-3 h-3" /> Phương thức
                    </div>
                    <p className="font-medium pl-5">
                      {PAYMENT_METHODS.find(
                        (pm) => pm.value === invoiceDetail.paymentMethod
                      )?.label || "Chưa xác định"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-semibold">
                      <Hash className="w-3 h-3" /> ID
                    </div>
                    <p
                      className="font-medium pl-5 font-mono text-xs text-muted-foreground truncate"
                      title={invoiceId}
                    >
                      {invoiceId}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Room Items Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Tiền phòng</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b bg-muted/5">
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground w-[50%]">
                            Mô tả
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            SL
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            Đơn giá
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            Thành tiền
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roomItems.length ? (
                          roomItems.map((item) => (
                            <TableRow
                              key={item.id}
                              className="border-b hover:bg-muted/5"
                            >
                              <TableCell className="py-3 font-medium text-sm">
                                {item.customItemName || item.description}
                              </TableCell>
                              <TableCell className="py-3 text-right text-sm">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm text-muted-foreground">
                                {formatMoney(item.unitPrice || 0).vndFormatted}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm font-medium">
                                {formatMoney(item.subtotal || 0).vndFormatted}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-24 text-center text-muted-foreground text-sm italic"
                            >
                              Chưa có tiền phòng
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Service Items Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Dịch vụ & Nhà hàng</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b bg-muted/5">
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground w-[50%]">
                            Mô tả
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            SL
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            Đơn giá
                          </TableHead>
                          <TableHead className="h-9 text-xs font-bold uppercase text-muted-foreground text-right">
                            Thành tiền
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceItems.length ? (
                          serviceItems.map((item) => (
                            <TableRow
                              key={item.id}
                              className="border-b hover:bg-muted/5"
                            >
                              <TableCell className="py-3 font-medium text-sm">
                                {item.customItemName || item.description}
                              </TableCell>
                              <TableCell className="py-3 text-right text-sm">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm text-muted-foreground">
                                {formatMoney(item.unitPrice || 0).vndFormatted}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm font-medium">
                                {formatMoney(item.subtotal || 0).vndFormatted}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-24 text-center text-muted-foreground text-sm italic"
                            >
                              Chưa có dịch vụ nào
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* RIGHT: PAYMENT & CALCULATIONS (ACTIONABLE) */}
            <CurrencyView
              amount={
                roomSubtotal + (calculatedFees?.totalAmount || serviceSubtotal)
              }
            >
              <div className="w-full lg:w-[420px] bg-muted/5 border-l flex flex-col h-full">
                <div className="p-8 flex-1 overflow-y-auto">
                  {/* 1. Calculation Block */}
                  <div className="space-y-3 mb-8">
                    {/* Room Charges (No Fees) */}
                    {roomItems.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tiền phòng
                        </span>
                        <span className="font-mono">
                          {formatMoney(roomSubtotal).vndFormatted}
                        </span>
                      </div>
                    )}

                    {/* Service/Menu Charges with Fees */}
                    {hasServiceItems && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Dịch vụ & Nhà hàng
                          </span>
                          <span className="font-mono">
                            {formatMoney(serviceSubtotal).vndFormatted}
                          </span>
                        </div>

                        {/* Visual separator for fee section */}
                        <div className="ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 space-y-2 py-2">
                          {/* Smart Toggles inside Calculation */}
                          <div className="flex justify-between items-center h-8">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="vat"
                                checked={applyVat}
                                onCheckedChange={setApplyVat}
                                className="scale-75 origin-left"
                                disabled={!paymentEligibility.canProceed}
                              />
                              <Label
                                htmlFor="vat"
                                className="text-xs cursor-pointer text-muted-foreground"
                              >
                                VAT (GTGT)
                              </Label>
                            </div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {
                                formatMoney(calculatedFees?.vatAmount || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>

                          <div className="flex justify-between items-center h-8">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="svc"
                                checked={applyServiceCharge}
                                onCheckedChange={setApplyServiceCharge}
                                className="scale-75 origin-left"
                                disabled={!paymentEligibility.canProceed}
                              />
                              <Label
                                htmlFor="svc"
                                className="text-xs cursor-pointer text-muted-foreground"
                              >
                                Phí dịch vụ
                              </Label>
                            </div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {
                                formatMoney(
                                  calculatedFees?.serviceChargeAmount || 0
                                ).vndFormatted
                              }
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Visual cue when only room items */}
                    {hasOnlyRoomItems && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-md">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Tiền phòng không áp dụng VAT và phí dịch vụ
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="font-mono text-xl font-bold">
                        {
                          formatMoney(
                            roomSubtotal +
                              (calculatedFees?.totalAmount || serviceSubtotal)
                          ).vndFormatted
                        }
                      </span>
                    </div>

                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-muted-foreground">
                        Đã thanh toán
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {
                          formatMoney(invoiceDetail.paidAmount || 0)
                            .vndFormatted
                        }
                      </span>
                    </div>

                    {/* Balance with visual distinction */}
                    {invoiceDetail.balance! > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-medium text-foreground">
                          Còn phải thu
                        </span>
                        <span className="font-mono font-bold text-destructive">
                          {formatMoney(invoiceDetail.balance || 0).vndFormatted}
                        </span>
                      </div>
                    )}

                    {/* Currency Conversion */}
                    <Separator className="my-3" />
                    <div className="space-y-2 bg-muted/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Quy đổi tiền tệ
                        </span>
                        <CurrencyView.Select />
                      </div>
                      <CurrencyView.Display showLabel={false} />
                    </div>
                  </div>

                  {/* 2. Payment Form */}
                  {paymentEligibility.canProceed &&
                    invoiceDetail.status !== "Paid" && (
                      <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="bg-background border rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase text-muted-foreground">
                              Cần thanh toán
                            </span>
                            <span className="font-mono text-lg font-bold text-primary">
                              {
                                formatMoney(invoiceDetail.balance || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>

                          <Form {...paymentForm}>
                            <form className="space-y-4">
                              <FormField
                                control={paymentForm.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          // ... (Giữ nguyên logic validation cũ)
                                          const val =
                                            parseFloat(e.target.value) || 0;
                                          field.onChange(val);
                                        }}
                                        endAddon={
                                          <span className="text-xs font-bold text-muted-foreground">
                                            VND
                                          </span>
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={paymentForm.control}
                                  name="method"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <PaymentMethodSelector
                                          value={field.value}
                                          onValueChange={field.onChange}
                                          bookingSource={bookingSource}
                                          className="h-10 w-40"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={paymentForm.control}
                                  name="transactionReference"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Mã GD / Ghi chú"
                                          {...field}
                                          value={field.value || ""}
                                          className="h-10"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {changeAmount > 0 && (
                                <div className="flex justify-between items-center p-2 bg-green-50 text-green-700 rounded text-sm">
                                  <span className="font-medium">
                                    Tiền thừa trả khách:
                                  </span>
                                  <span className="font-mono font-bold">
                                    {formatMoney(changeAmount).vndFormatted}
                                  </span>
                                </div>
                              )}
                            </form>
                          </Form>
                        </div>
                      </div>
                    )}
                </div>

                {/* 3. Footer Actions */}
                <div className="p-6 border-t bg-background">
                  {paymentEligibility.canProceed ? (
                    <Button
                      className="w-full h-12 text-base font-medium shadow-md transition-all hover:scale-[1.01]"
                      onClick={paymentForm.handleSubmit(handlePayment)}
                      disabled={!paymentValidation.isValid || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Xác nhận thanh toán{" "}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center h-12 text-muted-foreground text-sm italic bg-muted/10 rounded-md">
                      Hóa đơn này không thể thanh toán thêm.
                    </div>
                  )}
                </div>
              </div>
            </CurrencyView>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
