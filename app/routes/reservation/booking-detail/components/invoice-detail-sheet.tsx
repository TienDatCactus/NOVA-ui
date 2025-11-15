import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CreditCard, Info, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffCheckoutPaymentRequestDto } from "~/services/api/booking/dto";
import type { UpdateInvoiceRequestDto } from "~/services/api/invoices/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useCheckoutStore } from "~/store/checkout.store";
import {
  useCalculateInvoiceFees,
  useCheckout,
  useCheckoutPayment,
  useInvoiceDetail,
  useUpdateInvoice,
} from "../container/use-booking-checkout.hooks";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "~/components/ui/empty";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import {
  canInvoiceAcceptPayment,
  validatePaymentAmount,
} from "../container/payment-validation";

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
}

export default function InvoiceDetailSheet({
  open,
  onOpenChange,
  bookingId,
  invoiceId,
  onBack,
}: InvoiceDetailSheetProps) {
  const { applyVat, applyServiceCharge, setApplyVat, setApplyServiceCharge } =
    useCheckoutStore();

  // Fetch invoice detail
  const { data: invoiceDetail, isPending: isLoadingInvoice } = useInvoiceDetail(
    invoiceId,
    !!invoiceId && open
  );

  // Calculate fees with toggles
  const { data: calculatedFees, refetch: refetchFees } =
    useCalculateInvoiceFees(
      {
        subtotalAmount: invoiceDetail?.subTotal || 0,
        applyVat,
        applyServiceCharge,
      },
      !!invoiceDetail && open
    );

  // Refetch fees when toggles change
  useEffect(() => {
    if (invoiceDetail && open) {
      refetchFees();
    }
  }, [applyVat, applyServiceCharge, invoiceDetail, open, refetchFees]);

  // Mutations
  const { mutate: updateInvoice, isPending: isUpdatingInvoice } =
    useUpdateInvoice(invoiceId);

  const { mutate: processPayment, isPending: isProcessingPayment } =
    useCheckoutPayment(bookingId);

  const { mutate: finalizeCheckout, isPending: isCheckingOut } =
    useCheckout(bookingId);

  const isProcessing =
    isUpdatingInvoice || isProcessingPayment || isCheckingOut;

  // Payment form
  const paymentForm = useForm<CheckoutPaymentFormData>({
    resolver: zodResolver(StaffCheckoutPaymentRequestSchema),
    defaultValues: {
      method: "Cash",
      amount: 0,
      transactionReference: "",
    },
  });

  const method = paymentForm.watch("method");
  const amount = paymentForm.watch("amount");

  // Check if fees have changed
  const hasFeesChanged = useMemo(() => {
    if (!invoiceDetail || !calculatedFees) return false;

    const vatChanged =
      (calculatedFees.vatAmount || 0) !== (invoiceDetail.vatAmount || 0);
    const serviceChargeChanged =
      (calculatedFees.serviceChargeAmount || 0) !==
      (invoiceDetail.serviceChargeAmount || 0);

    return vatChanged || serviceChargeChanged;
  }, [invoiceDetail, calculatedFees]);

  // Auto-fill payment amount with invoice balance
  useEffect(() => {
    if (invoiceDetail?.balance && invoiceDetail.balance > 0) {
      paymentForm.setValue("amount", invoiceDetail.balance);
    }
  }, [invoiceDetail, paymentForm]);

  // Calculate change amount
  const changeAmount = useMemo(() => {
    const balance = invoiceDetail?.balance || 0;
    return amount > balance ? amount - balance : 0;
  }, [amount, invoiceDetail]);

  // Validate payment: must pay in full
  const isPaymentValid = useMemo(() => {
    const balance = invoiceDetail?.balance || 0;
    return balance === 0 || amount >= balance;
  }, [amount, invoiceDetail]);

  // Handler to update invoice fees
  const handleUpdateInvoice = () => {
    if (!calculatedFees || !invoiceDetail) return;

    const updateData: UpdateInvoiceRequestDto = {
      vatAmount: applyVat ? calculatedFees.vatAmount : 0,
      serviceChargeAmount: applyServiceCharge
        ? calculatedFees.serviceChargeAmount
        : 0,
      paymentMethod: invoiceDetail.paymentMethod || "Cash",
    };

    updateInvoice(updateData);
  };
  const paymentEligibility = useMemo(() => {
    if (!invoiceDetail?.status) return { canProceed: false };
    return canInvoiceAcceptPayment(invoiceDetail.status);
  }, [invoiceDetail?.status]);

  // Enhanced payment validation
  const paymentValidation = useMemo(() => {
    if (!invoiceDetail) return { isValid: false };

    return validatePaymentAmount(
      amount,
      invoiceDetail.balance || 0,
      calculatedFees?.totalAmount || invoiceDetail.total || 0,
      invoiceDetail.status || ""
    );
  }, [amount, invoiceDetail, calculatedFees]);

  // Handler to process payment
  const handlePayment = (data: CheckoutPaymentFormData) => {
    if (!paymentValidation.isValid) {
      paymentForm.setError("amount", {
        message: paymentValidation.error || "Số tiền không hợp lệ",
      });
      return;
    }

    const balance = invoiceDetail?.balance || 0;
    const willBeFullyPaid = data.amount >= balance;

    const paymentData: StaffCheckoutPaymentRequestDto = {
      method: data.method,
      amount: data.amount,
      transactionReference: data.transactionReference || undefined,
    };

    processPayment(paymentData, {
      onSuccess: () => {
        // Q4-A: Auto-checkout chỉ khi balance === 0 (thanh toán đủ)
        if (willBeFullyPaid) {
          handleFinalCheckout();
        }
      },
    });
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
          onBack();
        },
      }
    );
  };

  if (!invoiceDetail && !isLoadingInvoice) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-6xl p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">
            Chi tiết Invoice #{invoiceDetail?.invoiceNo || "..."}
          </SheetTitle>
          <SheetDescription>
            Xem chi tiết hóa đơn và xử lý thanh toán
          </SheetDescription>
        </SheetHeader>

        {isLoadingInvoice ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : invoiceDetail ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1 ">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h1 className="font-semibold">Thông tin hóa đơn</h1>
                    <Badge
                      variant={
                        INVOICE_STATUSES.find(
                          (s) => s.value === invoiceDetail.status
                        )?.variant
                      }
                    >
                      {
                        INVOICE_STATUSES.find(
                          (s) => s.value === invoiceDetail.status
                        )?.label
                      }
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Số hóa đơn</p>
                        <p className="font-mono font-semibold">
                          {invoiceDetail.invoiceNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ngày tạo</p>
                        <p className="font-medium">
                          {invoiceDetail.issuedAt
                            ? format(
                                parseISO(invoiceDetail.issuedAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Phương thức thanh toán
                        </p>
                        <p className="font-medium">
                          {
                            PAYMENT_METHODS.find(
                              (pm) => pm.value === invoiceDetail.paymentMethod
                            )?.label
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  {invoiceDetail.items && invoiceDetail.items.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mô tả</TableHead>
                          <TableHead className="text-right">SL</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-right">
                            Thành tiền
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceDetail.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.customItemName || item.description}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatMoney(item.unitPrice || 0).vndFormatted}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {formatMoney(item.subtotal || 0).vndFormatted}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Info />
                        </EmptyMedia>
                        <EmptyTitle>Không có mục nào</EmptyTitle>
                        <EmptyDescription>
                          Hóa đơn này chưa có mục chi tiết nào
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>

              <div>
                <Card className="shadow-sm gap-2 p-4">
                  <CardHeader className="p-0">
                    <CardTitle>Tính phí & Tổng tiền</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-mono">
                          {
                            formatMoney(invoiceDetail.subTotal || 0)
                              .vndFormatted
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <span className="text-muted-foreground">VAT: </span>{" "}
                          <Switch
                            id="vat-toggle"
                            checked={applyVat}
                            onCheckedChange={setApplyVat}
                          />
                        </div>
                        <span className="font-mono">
                          {
                            formatMoney(
                              calculatedFees?.vatAmount ||
                                invoiceDetail.vatAmount ||
                                0
                            ).vndFormatted
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <span className="text-muted-foreground">
                            Phí dịch vụ:
                          </span>
                          <Switch
                            id="service-charge-toggle"
                            checked={applyServiceCharge}
                            onCheckedChange={setApplyServiceCharge}
                          />
                        </div>
                        <span className="font-mono">
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
                      <div className="flex justify-between text-base font-semibold">
                        <span>Tổng cộng:</span>
                        <span className="font-mono text-primary">
                          {
                            formatMoney(
                              calculatedFees?.totalAmount ||
                                invoiceDetail.total ||
                                0
                            ).vndFormatted
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Đã thanh toán:
                        </span>
                        <span className="font-mono">
                          {
                            formatMoney(invoiceDetail.paidAmount || 0)
                              .vndFormatted
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold">
                        <span>Còn lại:</span>
                        <span className="font-mono text-destructive">
                          {formatMoney(invoiceDetail.balance || 0).vndFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Update Invoice Button */}
                    {hasFeesChanged && paymentEligibility.canProceed && (
                      <Button
                        onClick={handleUpdateInvoice}
                        disabled={isUpdatingInvoice}
                        variant="outline"
                        className="w-full"
                      >
                        {isUpdatingInvoice ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Cập nhật Invoice
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
                <Separator className="my-6" />
                {!paymentEligibility.canProceed && (
                  <Alert variant="destructive" className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {paymentEligibility.userMessage}
                    </AlertDescription>
                  </Alert>
                )}
                {paymentEligibility.canProceed &&
                  invoiceDetail?.status !== "Paid" && (
                    <div>
                      <Form {...paymentForm}>
                        <form className="space-y-4">
                          <FormField
                            control={paymentForm.control}
                            name="method"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phương thức thanh toán</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn phương thức" />
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
                                          <pm.icon className="w-4 h-4" />
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
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số tiền thanh toán</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => {
                                      const value =
                                        parseFloat(e.target.value) || 0;
                                      if (value < 0) {
                                        field.onChange(0);
                                        return;
                                      }
                                      field.onChange(value);

                                      // Real-time validation using new helper
                                      const validation = validatePaymentAmount(
                                        value,
                                        invoiceDetail.balance || 0,
                                        calculatedFees?.totalAmount ||
                                          invoiceDetail.total ||
                                          0,
                                        invoiceDetail.status || ""
                                      );

                                      if (!validation.isValid) {
                                        paymentForm.setError("amount", {
                                          message: validation.error,
                                        });
                                      } else {
                                        paymentForm.clearErrors("amount");
                                      }
                                    }}
                                    className={
                                      paymentForm.formState.errors.amount
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                    }
                                  />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormDescription className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                      Số tiền còn thiếu:
                                    </span>
                                    <span className="font-mono font-semibold text-destructive">
                                      {
                                        formatMoney(invoiceDetail?.balance || 0)
                                          .vndFormatted
                                      }
                                    </span>
                                  </FormDescription>
                                  <FormDescription className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                      Tổng hóa đơn:
                                    </span>
                                    <span className="font-mono font-semibold text-primary">
                                      {
                                        formatMoney(
                                          calculatedFees?.totalAmount ||
                                            invoiceDetail?.total ||
                                            0
                                        ).vndFormatted
                                      }
                                    </span>
                                  </FormDescription>
                                  {changeAmount > 0 && (
                                    <FormDescription className="flex items-center justify-between text-orange-600">
                                      <span>Tiền thừa:</span>
                                      <span className="font-mono font-semibold">
                                        {formatMoney(changeAmount).vndFormatted}
                                      </span>
                                    </FormDescription>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {method !== "Cash" && (
                            <FormField
                              control={paymentForm.control}
                              name="transactionReference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mã giao dịch</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Nhập mã giao dịch (tùy chọn)"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </form>
                      </Form>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer Actions */}
            <SheetFooter>
              {paymentEligibility.suggestedAction === "checkout" && (
                <Button variant={"info-outline"} onClick={handleFinalCheckout}>
                  Hoàn tất Checkout
                </Button>
              )}
              {paymentEligibility.suggestedAction === "refund" && (
                <Button variant="destructive">Xử lý hoàn trả</Button>
              )}
              {paymentEligibility.canProceed && (
                <Button
                  onClick={paymentForm.handleSubmit(handlePayment)}
                  disabled={!paymentValidation.isValid}
                >
                  Xác nhận thanh toán
                </Button>
              )}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
