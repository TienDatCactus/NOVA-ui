import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  Banknote,
  Calendar,
  Check,
  CreditCard,
  Hash,
  Loader2,
  RefreshCw,
  Tag,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { formatMoney } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffCheckoutPaymentRequestDto } from "~/services/api/booking/dto";
import type { UpdateInvoiceRequestDto } from "~/services/api/invoices/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useCheckoutStore } from "~/store/checkout.store";
import {
  useCalculateInvoiceFees,
  useCheckoutPayment,
  useInvoiceDetail,
  useUpdateInvoice,
} from "../../container/use-booking-checkout.hooks";
import {
  useInvoicePayment,
  useSyncInvoiceWithOrders,
} from "~/routes/invoices/container/invoices/mutation.hooks";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
} from "~/services/api/invoices/invoice.types";
import {
  canInvoiceAcceptPayment,
  validatePaymentAmount,
} from "../../container/payment-validation";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

const { StaffCheckoutPaymentRequestSchema } = BookingSchema;

type CheckoutPaymentFormData = z.infer<
  typeof BookingSchema.StaffCheckoutPaymentRequestSchema
>;

interface InvoiceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  invoiceId: string;
  onBack: () => void;
  isNewlyCreatedInvoice?: boolean;
}

export default function InvoiceDetailSheet({
  open,
  onOpenChange,
  bookingId,
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

  const { data: calculatedFees, refetch: refetchFees } =
    useCalculateInvoiceFees(
      {
        subtotalAmount: invoiceDetail?.subTotal || 0,
        applyVat,
        applyServiceCharge,
      },
      !!invoiceDetail && open
    );

  // --- EFFECTS ---
  useEffect(() => {
    if (invoiceDetail && open) refetchFees();
  }, [applyVat, applyServiceCharge, invoiceDetail, open, refetchFees]);

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

  // --- MUTATIONS ---
  const isCheckoutInvoice =
    isNewlyCreatedInvoice || invoiceDetail?.invoiceType === "Checkout";

  const { mutate: updateInvoice, isPending: isUpdatingInvoice } =
    useUpdateInvoice(invoiceId);
  const { mutate: checkoutPayment, isPending: isProcessingCheckoutPayment } =
    useCheckoutPayment(bookingId);
  const { mutate: invoicePayment, isPending: isProcessingInvoicePayment } =
    useInvoicePayment(invoiceId);
  const { mutate: syncInvoice, isPending: isSyncingInvoice } =
    useSyncInvoiceWithOrders(invoiceId);

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

  const paymentValidation = useMemo(() => {
    if (!invoiceDetail || !invoiceDetail.status) return { isValid: false };
    return validatePaymentAmount(
      amount,
      invoiceDetail.balance || 0,
      calculatedFees?.totalAmount || invoiceDetail.total || 0,
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

  const handlePayment = (data: CheckoutPaymentFormData) => {
    if (!paymentValidation.isValid) {
      paymentForm.setError("amount", {
        message: paymentValidation.error || "Số tiền không hợp lệ",
      });
      return;
    }

    const onSuccess = () => onBack();

    if (isCheckoutInvoice) {
      checkoutPayment(
        {
          method: data.method,
          amount: data.amount,
          transactionReference: data.transactionReference || undefined,
        },
        { onSuccess }
      );
    } else {
      invoicePayment(
        {
          method: data.method,
          amount: data.amount,
          note: data.transactionReference || "",
        },
        { onSuccess }
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
            {isCheckoutInvoice &&
              invoiceDetail?.status !== "Paid" &&
              invoiceDetail?.status !== "Voided" && (
                <Button
                  variant="info-outline"
                  size="sm"
                  onClick={handleSyncInvoice}
                  disabled={isSyncingInvoice}
                  className="h-8 text-xs text-muted-foreground hover:text-primary"
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

                {/* Line Items Table - Minimalist */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Chi tiết hạng mục</h3>
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
                        {invoiceDetail.items?.length ? (
                          invoiceDetail.items.map((item) => (
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
                              Chưa có mục nào
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
            <div className="w-full lg:w-[420px] bg-muted/5 border-l flex flex-col h-full">
              <div className="p-8 flex-1 overflow-y-auto">
                {/* 1. Calculation Block */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-mono">
                      {formatMoney(invoiceDetail.subTotal || 0).vndFormatted}
                    </span>
                  </div>

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
                        formatMoney(
                          calculatedFees?.vatAmount ||
                            invoiceDetail.vatAmount ||
                            0
                        ).vndFormatted
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
                          calculatedFees?.serviceChargeAmount ||
                            invoiceDetail.serviceChargeAmount ||
                            0
                        ).vndFormatted
                      }
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-baseline pt-2">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-mono text-xl font-bold">
                      {
                        formatMoney(
                          calculatedFees?.totalAmount ||
                            invoiceDetail.total ||
                            0
                        ).vndFormatted
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-muted-foreground">Đã thanh toán</span>
                    <span className="font-mono text-muted-foreground">
                      {formatMoney(invoiceDetail.paidAmount || 0).vndFormatted}
                    </span>
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
                                    <div className="relative">
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
                                        className="text-right font-mono text-lg font-semibold h-12 pr-12"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                        VND
                                      </span>
                                    </div>
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
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-10 w-40">
                                          <SelectValue placeholder="Phương thức" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {PAYMENT_METHODS.filter(
                                          (pm) => !pm.disabled
                                        ).map((pm) => (
                                          <SelectItem
                                            key={pm.value}
                                            value={pm.value}
                                          >
                                            <div className="flex items-center gap-2">
                                              <pm.icon className="w-3.5 h-3.5" />{" "}
                                              {pm.label}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
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
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
