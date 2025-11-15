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

  // Handler to process payment
  const handlePayment = (data: CheckoutPaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("amount", {
        message: "Phải thanh toán đủ số tiền còn thiếu",
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
        className="w-full sm:max-w-[90vw] lg:max-w-4xl p-0 flex flex-col"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Invoice Info Card */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Thông tin hóa đơn</CardTitle>
                    <Badge
                      variant={
                        invoiceDetail.status === "Paid"
                          ? "success"
                          : invoiceDetail.status === "Unpaid"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {invoiceDetail.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
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
                        {invoiceDetail.paymentMethod || "Chưa xác định"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items Table */}
              {invoiceDetail.items && invoiceDetail.items.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-lg">Chi tiết mục</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              )}

              {/* Fee Calculation & Toggles */}
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg">
                    Tính phí & Tổng tiền
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* VAT Toggle */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vat-toggle" className="font-semibold">
                        Áp dụng VAT
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Thuế giá trị gia tăng
                      </p>
                    </div>
                    <Switch
                      id="vat-toggle"
                      checked={applyVat}
                      onCheckedChange={setApplyVat}
                    />
                  </div>

                  {/* Service Charge Toggle */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor="service-charge-toggle"
                        className="font-semibold"
                      >
                        Áp dụng Phí dịch vụ
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Service charge
                      </p>
                    </div>
                    <Switch
                      id="service-charge-toggle"
                      checked={applyServiceCharge}
                      onCheckedChange={setApplyServiceCharge}
                    />
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span className="font-mono">
                        {formatMoney(invoiceDetail.subTotal || 0).vndFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT:</span>
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
                      <span className="text-muted-foreground">
                        Phí dịch vụ:
                      </span>
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
                  {hasFeesChanged && (
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

              {/* Payment Form (only if balance > 0) */}
              {invoiceDetail.status != "Paid" && (
                <Card className="shadow-sm">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-lg">Thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
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
                                    <SelectItem key={pm.value} value={pm.value}>
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
                                  placeholder="Nhập số tiền"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Phải thanh toán đủ:{" "}
                                {
                                  formatMoney(invoiceDetail.balance || 0)
                                    .vndFormatted
                                }
                              </FormDescription>
                              {changeAmount > 0 && (
                                <FormDescription className="text-success font-semibold">
                                  Tiền thừa:{" "}
                                  {formatMoney(changeAmount).vndFormatted}
                                </FormDescription>
                              )}
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Footer Actions */}
            <SheetFooter className="p-6 border-t flex-col gap-3">
              {(invoiceDetail.balance || 0) > 0 && isPaymentValid && (
                <Alert className="w-full">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Thanh toán đủ sẽ tự động hoàn tất checkout
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end items-center w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isProcessing}
                >
                  Quay lại
                </Button>
                {invoiceDetail.status != "Paid" && (
                  <Button
                    type="button"
                    onClick={paymentForm.handleSubmit(handlePayment)}
                    disabled={isProcessingPayment || !isPaymentValid}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Xác nhận thanh toán
                      </>
                    )}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
